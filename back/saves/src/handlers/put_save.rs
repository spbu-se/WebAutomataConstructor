use actix_web::web::{Json, ReqData};
use actix_web::{HttpResponse, Responder};
use serde::Deserialize;

use core::database::services::{insert_save, select_save_by_name, update_save_save};

#[derive(Deserialize)]
pub struct PutSaveRequest {
    pub name: String,
    pub save: String,
}

pub async fn put_save(user_id: ReqData<String>, request: Json<PutSaveRequest>) -> impl Responder {
    let user_id = user_id.into_inner();
    let request = request.into_inner();

    let save = select_save_by_name(&user_id, &request.name);

    match save {
        Some(save) => {
            update_save_save(save.id, &request.save);
            return HttpResponse::Ok();
        }
        None => {
            insert_save(user_id, request.name, request.save);
            return HttpResponse::Created();
        }
    }
}
