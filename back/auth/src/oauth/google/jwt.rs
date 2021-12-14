use super::KeyProvider;
use derive_getters::Getters;
use openssl::hash::MessageDigest;
use openssl::sign::Verifier;
use serde::{Deserialize, Serialize};
use std::fmt::Display;
use std::time::{SystemTime, UNIX_EPOCH};
use std::{env, error, str};

#[derive(Debug)]
pub struct Error {
    msg: &'static str,
    kind: ErrorKind,
    inner: Option<Box<dyn error::Error>>,
}

impl Error {
    pub fn new(msg: &'static str, kind: ErrorKind) -> Error {
        Error { msg, kind, inner: None }
    }

    pub fn from_err(msg: &'static str, kind: ErrorKind, inner: Box<dyn error::Error>) -> Error {
        Error {
            msg,
            kind,
            inner: Some(inner),
        }
    }
}

impl From<super::key_provider::Error> for Error {
    fn from(err: super::key_provider::Error) -> Self {
        Error {
            msg: "KeyProvider error",
            kind: ErrorKind::Verification,
            inner: Some(Box::new(err)),
        }
    }
}

impl Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

impl error::Error for Error {}

#[derive(Debug, PartialEq)]
pub enum ErrorKind {
    /// Failed to verify jwt.
    Verification,

    /// Failed to parse and decode jwt.
    Parsing,
}

#[derive(Debug, PartialEq)]
pub enum VerificationResult {
    Verified,
    BadSigned,
    Expired,
    BadIssuer,
    BadAudience,
}

/// Google OAuth jwt header structure.
///
/// Contains information about signing and token.
#[derive(Debug, Deserialize, Serialize, Getters)]
pub struct JwtHead {
    /// Algorithm used for sign generation.
    alg: String,

    /// Public key id.
    kid: String,

    /// Token type.
    typ: String,
}

/// Google OAuth jwt body structure.
///
/// Contains informative payload.
#[derive(Debug, Deserialize, Serialize, Getters)]
pub struct JwtBody {
    /// The audience that this ID token is intended for. It must be one of the
    /// OAuth 2.0 client IDs of your application.
    aud: String,

    /// Expiration time on or after which the ID token must not be accepted.
    /// Represented in Unix time (integer seconds).
    exp: u64,

    /// The time the ID token was issued. Represented in Unix time (integer
    /// seconds).
    iat: u64,

    /// The Issuer Identifier for the Issuer of the response.
    /// Always https://accounts.google.com or accounts.google.com for Google ID tokens.
    iss: String,

    /// An identifier for the user, unique among all Google accounts and never
    /// reused. A Google account can have multiple email addresses at different
    /// points in time, but the sub value is never changed. Use sub within your
    /// application as the unique-identifier key for the user. Maximum length of
    /// 255 case-sensitive ASCII characters.
    sub: String,

    /// Access token hash. Provides validation that the access token is tied to
    /// the identity token. If the ID token is issued with an access_token value
    /// in the server flow, this claim is always included. This claim can be
    /// used as an alternate mechanism to protect against cross-site request
    /// forgery attacks.
    at_hash: Option<String>,

    /// The client_id of the authorized presenter. This claim is only needed
    /// when the party requesting the ID token is not the same as the audience
    /// of the ID token. This may be the case at Google for hybrid apps where a
    /// web application and Android app have a different OAuth 2.0 client_id but
    /// share the same Google APIs project.
    azp: Option<String>,

    /// The user's email address. This value may not be unique to this user and
    /// is not suitable for use as a primary key. Provided only if your scope
    /// included the email scope value.
    email: Option<String>,

    /// True if the user's e-mail address has been verified; otherwise false.
    email_verified: Option<bool>,

    /// The user's surname(s) or last name(s). Might be provided when a 'name'
    /// claim is present.
    family_name: Option<String>,

    /// The user's given name(s) or first name(s). Might be provided when a
    /// 'name' claim is present.
    given_name: Option<String>,

    /// The hosted G Suite domain of the user. Provided only if the user belongs
    /// to a hosted domain.
    hd: Option<String>,

    /// The user's locale, represented by a BCP 47 language tag. Might be
    /// provided when a 'name' claim is present.
    locale: Option<String>,

    /// The user's full name, in a displayable form. Might be provided when:
    ///
    /// * The request scope included the string "profile"
    /// * The ID token is returned from a token refresh
    ///
    /// When 'name' claims are present, you can use them to update your app's
    /// user records. Note that this claim is never guaranteed to be present.
    name: Option<String>,

    /// The value of the nonce supplied by your app in the authentication
    /// request.
    nonce: Option<String>,

    /// The URL of the user's profile picture. Might be provided when:
    ///
    /// * The request scope included the string "profile"
    /// * The ID token is returned from a token refresh
    ///
    /// When 'picture' claims are present, you can use them to update your app's
    /// user records. Note that this claim is never guaranteed to be present.
    picture: Option<String>,

    /// The URL of the user's profile page. Might be provided when:
    ///
    /// * The request scope included the string "profile"
    /// * The ID token is returned from a token refresh
    ///
    /// When 'profile' claims are present, you can use them to update your
    /// app's user records. Note that this claim is never guaranteed to be
    /// present.
    profile: Option<String>,
}

/// Jwt token received from Google OAuth.
#[derive(Debug, Getters)]
pub struct Jwt {
    /// Jwt header.
    head: JwtHead,

    /// Jwt payload.
    body: JwtBody,

    /// Verification status.
    verification: VerificationResult,
}

impl Jwt {
    /// Creates a new instance of the `Jwt` structure.
    ///
    /// This method parses encoded jwt token to a structure.
    /// During verifing validity method check `iss`, `aud`, `exp` field and
    /// check sign:
    ///
    /// * `iss` should be "https://accounts.google.com" or "accounts.google.com"
    /// * `aud` should be equal to client id of application used for OAuth. This
    ///   info taken from `GOOGLE_OAUTH_CLIENT_ID` environment variable or
    ///   `.env` file.
    /// * `exp` should be equal or greater than "now" unix time.
    /// * sign should be generated via SHA256 from encoded token header and
    ///   payload using one of google private keys.
    ///
    /// For more information see [Google documentation on OpenID connect](https://developers.google.com/identity/protocols/oauth2/openid-connect)
    ///
    /// # Arguments
    ///
    /// * id_token -- encoded jwt token in format "header.payload.sign"
    /// * key_provider -- provider of google public keys used for sign check.
    ///
    /// # Returns
    ///
    /// This method returns `Ok(Jwt)` is jwt successfully parsed and validated
    /// and `Err(GoogleOAuthError)` otherwise.
    pub fn new(id_token: &str, key_provider: &mut KeyProvider) -> Result<Jwt, Error> {
        let mut id_token = id_token.split('.');

        let encoded_head = id_token
            .next()
            .ok_or(Error::new("No head in jwt", ErrorKind::Parsing))?;

        let encoded_body = id_token
            .next()
            .ok_or(Error::new("No body in jwt", ErrorKind::Parsing))?;

        let encoded_sign = id_token
            .next()
            .ok_or(Error::new("No sign in jwt", ErrorKind::Parsing))?;

        let decoded_head = base64::decode_config(encoded_head, base64::URL_SAFE)
            .map_err(|err| Error::from_err("Failed to decode jwt head", ErrorKind::Parsing, Box::new(err)))?;

        let decoded_body = base64::decode_config(encoded_body, base64::URL_SAFE)
            .map_err(|err| Error::from_err("Failed to decode jwt body", ErrorKind::Parsing, Box::new(err)))?;

        let decoded_sign = base64::decode_config(encoded_sign, base64::URL_SAFE)
            .map_err(|err| Error::from_err("Failed to decode jwt sign", ErrorKind::Parsing, Box::new(err)))?;

        let head_str = str::from_utf8(&decoded_head)
            .map_err(|err| Error::from_err("Failed to convert jwt head to str", ErrorKind::Parsing, Box::new(err)))?;

        let body_str = str::from_utf8(&decoded_body)
            .map_err(|err| Error::from_err("Failed to convert jwt head to str", ErrorKind::Parsing, Box::new(err)))?;

        let head = serde_json::from_str::<JwtHead>(head_str)
            .map_err(|err| Error::from_err("Failed to deserialize jwt head", ErrorKind::Parsing, Box::new(err)))?;

        let body = serde_json::from_str::<JwtBody>(body_str)
            .map_err(|err| Error::from_err("Failed to deserialize jwt body", ErrorKind::Parsing, Box::new(err)))?;

        let verification = Self::validate(&head, &body, key_provider, encoded_head, encoded_body, &decoded_sign)?;

        Ok(Jwt {
            head,
            body,
            verification,
        })
    }

    /// Validates jwt token.
    ///
    /// Returns `Ok(())` is jwt verified and
    /// `Err(GoogleOAuthError(GoogleOAuthErrorKind::JwtUnverified(kind)))`
    /// otherwise.
    fn validate(
        head: &JwtHead,
        body: &JwtBody,
        key_provider: &mut KeyProvider,
        encoded_head: &str,
        encoded_body: &str,
        sign: &[u8],
    ) -> Result<VerificationResult, Error> {
        if !Self::validate_sign(head.kid().clone(), key_provider, encoded_head, encoded_body, sign)? {
            return Ok(VerificationResult::BadSigned);
        }

        if !Self::validate_iss(body.iss())? {
            return Ok(VerificationResult::BadIssuer);
        }

        if !Self::validate_aud(body.aud())? {
            return Ok(VerificationResult::BadAudience);
        }

        if !Self::validate_exp(body.exp())? {
            return Ok(VerificationResult::Expired);
        }

        Ok(VerificationResult::Verified)
    }

    /// Validates jwt sign.
    ///
    /// Uses SHA256 algorithm and public key received from `key_provider`
    /// argument.
    fn validate_sign(
        kid: String,
        key_provider: &mut KeyProvider,
        encoded_head: &str,
        encoded_body: &str,
        sign: &[u8],
    ) -> Result<bool, Error> {
        let pkey = key_provider.key_from_kid(&kid)?;

        let mut verifier = Verifier::new(MessageDigest::sha256(), pkey).map_err(|err| {
            Error::from_err(
                "Failed to create openssl verifier",
                ErrorKind::Verification,
                Box::new(err),
            )
        })?;

        let text = format!("{}.{}", encoded_head, encoded_body);

        verifier.update(text.as_bytes()).map_err(|err| {
            Error::from_err(
                "Failed to push jwt text to verifier",
                ErrorKind::Verification,
                Box::new(err),
            )
        })?;

        verifier.verify(sign).map_err(|err| {
            Error::from_err(
                "Failed to verify sign using openssl",
                ErrorKind::Verification,
                Box::new(err),
            )
        })
    }

    /// Validates jwt issuer.
    ///
    /// Issuer should be "https://accounts.google.com" or "accounts.google.com" according to [Google documentation](https://developers.google.com/identity/protocols/oauth2/openid-connect?hl=en#validatinganidtoken)
    fn validate_iss(iss: &str) -> Result<bool, Error> {
        Ok(iss == "https://accounts.google.com" || iss == "accounts.google.com")
    }

    /// Validates jwt audience.
    ///
    /// Audience should be client id used in OAuth process.
    fn validate_aud(aud: &str) -> Result<bool, Error> {
        let client_id = env::var("GOOGLE_OAUTH_CLIENT_ID").map_err(|err| {
            Error::from_err(
                "`GOOGLE_OAUTH_CLIENT_ID` is not specified",
                ErrorKind::Verification,
                Box::new(err),
            )
        })?;

        Ok(aud == client_id)
    }

    /// Validates jwt expiring time.
    fn validate_exp(&exp: &u64) -> Result<bool, Error> {
        let since_unix_epoch = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|err| {
                Error::from_err(
                    "Failed to get time from unix epoch",
                    ErrorKind::Verification,
                    Box::new(err),
                )
            })?
            .as_secs();

        Ok(since_unix_epoch <= exp)
    }
}
