use actix_web::web::{Data, Json};
use actix_web::{HttpResponse, Responder};
use core::intercom::{AuthRequest, AuthResponse};
use log::info;
use std::sync::Mutex;

use crate::oauth::google::jwt::VerificationResult;
use crate::oauth::google::{self, Jwt};

pub async fn auth_handler(
    req: Json<AuthRequest>,
    google_key_provider: Data<Mutex<google::KeyProvider>>,
) -> impl Responder {
    let req = req.into_inner();
    let google_key_provider = google_key_provider.into_inner();
    let mut google_key_provider = google_key_provider.lock().unwrap();

    match &req.kind[..] {
        "g" => {
            let jwt = match Jwt::new(&req.token, &mut google_key_provider) {
                Ok(jwt) => jwt,
                Err(err) => {
                    info!("Failed to create jwt: {}", err);
                    return HttpResponse::Ok().json(AuthResponse::bad());
                }
            };

            match jwt.verification() {
                VerificationResult::Verified => HttpResponse::Ok().json(AuthResponse::good(jwt.body().sub().clone())),
                VerificationResult::Expired => unimplemented!(),
                _ => HttpResponse::Ok().json(AuthResponse::bad()),
            }
        }
        _ => HttpResponse::Ok().json(AuthResponse::bad()),
    }
}
