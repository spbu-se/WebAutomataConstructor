use core::database::services;
use actix_web::web::ReqData;
use actix_web::Responder;

pub async fn ping_handler(uid: ReqData<String>) -> impl Responder {
    let user = services::get_user(uid.into_inner());

    format!("pong\n{:?}", user)
}
