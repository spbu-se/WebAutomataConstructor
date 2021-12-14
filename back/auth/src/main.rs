use actix_web::web::Data;
use actix_web::{web, App, HttpServer};
use log::Level;
use std::env;
use std::sync::Mutex;

mod auth_handler;
mod oauth;
mod obtain_handler;
mod state;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Hello, world!");
    dotenv::dotenv().unwrap();
    simple_logger::init_with_level(Level::Debug).unwrap();

    let google_public_key_provider_data = Data::new(Mutex::new(oauth::google::KeyProvider::new()));
    let state_data = Data::new(Mutex::new(state::State::new()));

    HttpServer::new(move || {
        let cors = core::server::cors();

        App::new().wrap(cors).service(
            web::scope("/auth")
                .service(
                    web::scope("/oauth").service(
                        web::scope("/google")
                            .app_data(google_public_key_provider_data.clone())
                            .app_data(state_data.clone())
                            .route("/callback", web::get().to(oauth::google::callback_handler)),
                    ),
                )
                .service(
                    web::scope("")
                        .app_data(google_public_key_provider_data.clone())
                        .app_data(state_data.clone())
                        .route("", web::post().to(auth_handler::auth_handler))
                        .route("/obtain/{state}", web::get().to(obtain_handler::obtain_handler))
                )
        )
    })
    .bind(env::var("LISTEN_URL").unwrap())
    .unwrap()
    .run()
    .await
}
