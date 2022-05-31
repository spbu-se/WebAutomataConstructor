use actix_web::web::{Path, ReqData};
use actix_web::{HttpResponse, Responder};

use core::database::services::{self, select_save};

pub async fn delete_save(user_id: ReqData<String>, Path(save_id): Path<i32>) -> impl Responder {
    let user_id = user_id.into_inner();

    let save = select_save(&user_id, save_id);

    match save {
        Some(save) => {
            services::delete_save(save.id);
            HttpResponse::Ok()
        }
        None => HttpResponse::NotFound(),
    }
}
