use std::sync::Mutex;

use actix_web::web::{Data, Path};
use actix_web::{HttpResponse, Responder};
use serde::Serialize;

use crate::state::State;

#[derive(Serialize)]
pub struct ObtainResponse {
    pub value: String,
}
pub async fn obtain_handler(Path(state): Path<String>, state_manager: Data<Mutex<State>>) -> impl Responder {
    let state_manager = state_manager.into_inner();
    let mut state_manager = state_manager.lock().unwrap();

    let value = state_manager.take(&state);

    if let Some(value) = value {
        HttpResponse::Ok().json(ObtainResponse { value })
    } else {
        HttpResponse::BadRequest().finish()
    }
}
