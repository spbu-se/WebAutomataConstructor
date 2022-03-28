use actix_web::web::ReqData;
use actix_web::{HttpResponse, Responder};

use core::database::services::get_user;

pub async fn get(user_id: ReqData<String>) -> impl Responder {
    let user_id = user_id.into_inner();

    let user = get_user(user_id);

    match user {
        Some(user) => {
            return HttpResponse::Ok().json(user);
        }
        None => {
            return HttpResponse::NotFound().finish();
        }
    }
}
