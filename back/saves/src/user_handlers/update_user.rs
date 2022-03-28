use actix_web::web::{Json, ReqData};
use actix_web::{HttpResponse, Responder};

use core::database::models::UpdateUser;
use core::database::services::update_user;


pub async fn update(user_id: ReqData<String>, request: Json<UpdateUser>) -> impl Responder {
    let user_id = user_id.into_inner();
    let request = request.into_inner();

    let updated_user = update_user(user_id, request);

    match updated_user {
        Some(updated_user) => {
            return HttpResponse::Ok().json(updated_user);
        }
        None => {
            return HttpResponse::BadRequest().finish();
        }
    }
}
