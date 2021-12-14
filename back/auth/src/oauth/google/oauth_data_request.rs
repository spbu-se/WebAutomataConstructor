use actix_web::web;
use derive_getters::Getters;
use log::debug;
use reqwest::blocking::Client;
use serde::{Deserialize, Serialize};
use std::fmt::Display;
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

impl Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

impl error::Error for Error {}

#[derive(Debug, PartialEq)]
pub enum ErrorKind {
    Env,
    Http,
}

/// Request form model.
#[derive(Debug, Deserialize, Serialize)]
pub struct OAuthDataRequest {
    code: String,
    client_id: String,
    client_secret: String,
    redirect_uri: String,
    grant_type: String,
}

impl OAuthDataRequest {
    /// Creates a new instance of the `OAuthDataRequest` struct with specified
    /// `code` and environment variables.
    ///
    /// # Arguments
    ///
    /// * `code` -- code received from google
    ///
    /// # Panics
    ///
    /// This method will panic if:
    ///    
    /// * `GOOGLE_OAUTH_CLIENT_ID` is not presented in `.env` file or
    ///   environment variables.
    /// * `GOOGLE_OAUTH_CLIENT_SECRET` is not presented in `.env` file or
    ///   environment variables.
    /// * `GOOGLE_OAUTH_REDIRECT_URI` is not presented in `.env` file or
    ///   environment variables.
    pub fn new(code: String) -> Result<OAuthDataRequest, Error> {
        Ok(OAuthDataRequest {
            code,
            client_id: env::var("GOOGLE_OAUTH_CLIENT_ID").map_err(|err| {
                Error::from_err(
                    "`GOOGLE_OAUTH_CLIENT_ID` is not specified",
                    ErrorKind::Env,
                    Box::new(err),
                )
            })?,
            client_secret: env::var("GOOGLE_OAUTH_CLIENT_SECRET").map_err(|err| {
                Error::from_err(
                    "`GOOGLE_OAUTH_CLIENT_SECRET` is not specified",
                    ErrorKind::Env,
                    Box::new(err),
                )
            })?,
            redirect_uri: env::var("GOOGLE_OAUTH_REDIRECT_URI").map_err(|err| {
                Error::from_err(
                    "`GOOGLE_OAUTH_REDIRECT_URI` is not specified",
                    ErrorKind::Env,
                    Box::new(err),
                )
            })?,
            grant_type: String::from("authorization_code"),
        })
    }
}

/// OAuth data model.
#[derive(Debug, Deserialize, Serialize, Getters)]
pub struct OAuthData {
    access_token: String,
    expires_in: u32,
    scope: String,
    token_type: String,
    id_token: String,
    refresh_token: Option<String>,
}

/// Requests OAuth data such as access token and ID token from Google.
///
/// This is step after callback handler got code from Google.
/// For more details about OAuth process see [https://developers.google.com/identity/protocols/oauth2/openid-connect](Google documentation).
///
/// # Arguments
///
/// * `request_data` -- request data which contains code, secrets, etc.
///
/// # Panics
///
/// This method will panic if `GOOGLE_OAUTH_TOKEN_URI` is not presented in
/// `.env` file or environment variables.
pub async fn request_oauth_data(request_data: OAuthDataRequest) -> Result<OAuthData, Error> {
    let token_uri = env::var("GOOGLE_OAUTH_TOKEN_URI").map_err(|err| {
        Error::from_err(
            "`GOOGLE_OAUTH_TOKEN_URI` is not specified",
            ErrorKind::Env,
            Box::new(err),
        )
    })?;

    let response = web::block(move || Client::new().post(token_uri).form(&request_data).send())
        .await
        .map_err(|err| Error::from_err("Failed to send http request", ErrorKind::Http, Box::new(err)))?;

    if !response.status().is_success() {
        let text = response.text();
        debug!("Response text: {:?}", text);
        return Err(Error::new("Response have not 2** status", ErrorKind::Http));
    }

    response
        .json::<OAuthData>()
        .map_err(|err| Error::from_err("Failed to deserialize response body", ErrorKind::Http, Box::new(err)))
}
