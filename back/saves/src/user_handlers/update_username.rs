use actix_web::web::{Json, ReqData};
use actix_web::{HttpResponse, Responder};
use serde::Deserialize;

use core::database::services::{update_user_username};

#[derive(Deserialize)]
pub struct UpdateUsernameRequest {
    pub username: String,
}

pub async fn update_username(user_id: ReqData<String>, request: Json<UpdateUsernameRequest>) -> impl Responder {
    let user_id = user_id.into_inner();
    let request = request.into_inner();

    let updated_user = update_user_username(user_id, request.username);

    match updated_user {
        Some(updated_user) => {
            return HttpResponse::Ok().json(updated_user);
        }
        None => {
            return HttpResponse::BadRequest().finish();
        }
    }
}
