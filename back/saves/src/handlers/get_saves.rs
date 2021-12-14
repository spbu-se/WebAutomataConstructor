use actix_web::web::{Json, ReqData};
use actix_web::Responder;

use core::database::services::select_user_saves;

pub async fn get_saves(user_id: ReqData<String>) -> impl Responder {
    let user_id = user_id.into_inner();

    let saves = select_user_saves(&user_id);

    Json(saves)
}
