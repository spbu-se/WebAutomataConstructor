use super::{request_oauth_data, Jwt, KeyProvider, OAuthDataRequest};
use crate::state::State;
use actix_web::web::{Data, Query};
use actix_web::{HttpResponse, Responder};
use core::database::services;
use log::error;
use serde::{Deserialize, Serialize};
use std::env;
use std::str;
use std::sync::Mutex;

/// Callback query model.
#[derive(Debug, Deserialize, Serialize)]
pub struct CallbackData {
    code: String,
    state: String,
}

/// Callback for Google OAuth 2.0 process.
///
/// This callback should handle request from Google after user sign in.
pub async fn callback_handler(
    data: Query<CallbackData>,
    key_provider: Data<Mutex<KeyProvider>>,
    state: Data<Mutex<State>>,
) -> impl Responder {
    let data = data.into_inner();
    let key_provider = key_provider.into_inner();
    let mut key_provider = key_provider.lock().unwrap();

    let oauth_data_request = match OAuthDataRequest::new(data.code) {
        Ok(data) => data,
        Err(err) => {
            error!("Failed to create data request: {}", err);
            return HttpResponse::PermanentRedirect()
                .header("Location", env::var("FAILED_REDIRECT_URL").unwrap())
                .finish();
        }
    };

    let oauth_data = match request_oauth_data(oauth_data_request).await {
        Ok(data) => data,
        Err(err) => {
            error!("Failed to request data: {}", err);
            return HttpResponse::PermanentRedirect()
                .header("Location", env::var("FAILED_REDIRECT_URL").unwrap())
                .finish();
        }
    };

    let jwt = match Jwt::new(oauth_data.id_token(), &mut key_provider) {
        Ok(jwt) => jwt,
        Err(err) => {
            error!("Bad jwt from google: {}", err);
            return HttpResponse::PermanentRedirect()
                .header("Location", env::var("FAILED_REDIRECT_URL").unwrap())
                .finish();
        }
    };

    services::register_user(jwt.body().sub().clone()); // todo: error handling

    let state = state.into_inner();
    let mut state = state.lock().unwrap();
    state.put(data.state, String::from(oauth_data.id_token()));

    HttpResponse::PermanentRedirect()
        .header("Location", env::var("SUCCESS_REDIRECT_URL").unwrap())
        .finish()
}
