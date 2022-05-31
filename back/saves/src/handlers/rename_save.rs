use actix_web::web::{Json, Path, ReqData};
use actix_web::{HttpResponse, Responder};
use serde::Deserialize;

use core::database::services::{select_save, update_save_name};

#[derive(Deserialize)]
pub struct RenameSaveRequest {
    pub name: String,
}

pub async fn rename_save(
    user_id: ReqData<String>,
    Path(save_id): Path<i32>,
    request: Json<RenameSaveRequest>,
) -> impl Responder {
    let user_id = user_id.into_inner();
    let request = request.into_inner();

    let save = select_save(&user_id, save_id);

    match save {
        None => HttpResponse::NotFound(),
        Some(save) => {
            update_save_name(save.id, &request.name);
            HttpResponse::Ok()
        }
    }
}
