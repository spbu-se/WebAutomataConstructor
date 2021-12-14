use actix_web::web::{Path, ReqData};
use actix_web::{HttpResponse, Responder};

use core::database::services::select_save;

pub async fn get_save(user_id: ReqData<String>, Path(save_id): Path<i32>) -> impl Responder {
    let user_id = user_id.into_inner();

    let save = select_save(&user_id, save_id);

    match save {
        Some(save) => HttpResponse::Ok().json(save),
        None => HttpResponse::NotFound().finish(),
    }
}
