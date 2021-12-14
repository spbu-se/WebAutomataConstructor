use cache_control::CacheControl;
use chrono::{DateTime, Duration, NaiveDateTime, Utc};
use derive_getters::Getters;
use log::info;
use openssl::bn::BigNum;
use openssl::pkey;
use openssl::pkey::PKey;
use openssl::rsa::Rsa;
use serde::Deserialize;
use std::collections::HashMap;
use std::error;
use std::fmt::Display;

const CERTIFICATES_URL: &str = "https://www.googleapis.com/oauth2/v3/certs";

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

impl Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

impl error::Error for Error {}

#[derive(Debug, PartialEq)]
pub enum ErrorKind {
    /// Failed to convert jwk during refresh certificates process.
    JwkConvertion,

    /// Failed to make request to certificates endpoint, i.e no internet or no
    /// required headers.
    RefreshHttpRequest,

    /// Requested kid is invalid and not present in certificates.
    InvalidKid,
}

#[derive(Debug, Deserialize, Getters)]
struct Certificate {
    kid: String,
    n: String,
    e: String,
}

#[derive(Debug, Deserialize, Getters)]
struct CertificatesResponse {
    keys: Vec<Certificate>,
}

pub struct KeyProvider {
    keys_by_kid: HashMap<String, PKey<pkey::Public>>,
    expires: DateTime<Utc>,
}

impl KeyProvider {
    pub fn new() -> KeyProvider {
        KeyProvider {
            keys_by_kid: HashMap::new(),
            expires: DateTime::from_utc(NaiveDateTime::from_timestamp(0, 0), Utc),
        }
    }

    pub fn key_from_kid(&mut self, kid: &str) -> Result<&PKey<pkey::Public>, Error> {
        if self.expires < Utc::now() {
            self.refresh_keys()?;
        }

        self.keys_by_kid.get(kid).ok_or(Error::new(
            "Requested kid is not presented in certficates",
            ErrorKind::InvalidKid,
        ))
    }

    fn refresh_keys(&mut self) -> Result<(), Error> {
        let res = reqwest::blocking::get(CERTIFICATES_URL).map_err(|err| {
            Error::from_err(
                "Request to certificates endpoint failed",
                ErrorKind::RefreshHttpRequest,
                Box::new(err),
            )
        })?;

        let cache_control_header = res
            .headers()
            .get("cache-control")
            .ok_or(Error::new("No cache-control header", ErrorKind::RefreshHttpRequest))?
            .to_str()
            .map_err(|err| {
                Error::from_err(
                    "Failed to convert cache-control header to str",
                    ErrorKind::RefreshHttpRequest,
                    Box::new(err),
                )
            })?;

        let max_age = CacheControl::from_value(cache_control_header)
            .ok_or(Error::new(
                "Failed to parse cache-control header",
                ErrorKind::RefreshHttpRequest,
            ))?
            .max_age
            .ok_or(Error::new(
                "No max_age in cache-control header",
                ErrorKind::RefreshHttpRequest,
            ))?;

        let json = res.json::<CertificatesResponse>().map_err(|err| {
            Error::from_err(
                "Failed to deserialize json body",
                ErrorKind::RefreshHttpRequest,
                Box::new(err),
            )
        })?;

        self.keys_by_kid.clear();

        for jwk in json.keys() {
            let key = Self::key_from_jwk(jwk.n(), jwk.e())?;

            self.keys_by_kid.insert(jwk.kid().clone(), key);
        }

        self.expires = Utc::now() + (max_age - Duration::minutes(1));

        info!("Google OAuth certificates refreshed. Expires in {}", self.expires);

        Ok(())
    }

    fn key_from_jwk(encoded_n: &str, encoded_e: &str) -> Result<PKey<pkey::Public>, Error> {
        let decoded_n = base64::decode_config(encoded_n, base64::URL_SAFE)
            .map_err(|err| Error::from_err("Failed to decode n", ErrorKind::JwkConvertion, Box::new(err)))?;

        let decoded_e = base64::decode_config(encoded_e, base64::URL_SAFE)
            .map_err(|err| Error::from_err("Failed to decode e", ErrorKind::JwkConvertion, Box::new(err)))?;

        let n = BigNum::from_slice(&decoded_n).map_err(|err| {
            Error::from_err(
                "Failed to create openssl big num from decoded n",
                ErrorKind::JwkConvertion,
                Box::new(err),
            )
        })?;

        let e = BigNum::from_slice(&decoded_e).map_err(|err| {
            Error::from_err(
                "Failed to create openssl big num from decoded e",
                ErrorKind::JwkConvertion,
                Box::new(err),
            )
        })?;

        let rsa = Rsa::from_public_components(n, e).map_err(|err| {
            Error::from_err(
                "Failed to create rsa key from n and e",
                ErrorKind::JwkConvertion,
                Box::new(err),
            )
        })?;

        PKey::from_rsa(rsa).map_err(|err| {
            Error::from_err(
                "Failed to create public key from rsa",
                ErrorKind::JwkConvertion,
                Box::new(err),
            )
        })
    }
}
