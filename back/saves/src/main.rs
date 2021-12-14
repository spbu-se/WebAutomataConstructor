use actix_web::{web, App, HttpServer};
use log::Level;
use std::env;

mod auth_middleware;
mod handlers;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Hello, world!");
    dotenv::dotenv().unwrap();
    simple_logger::init_with_level(Level::Debug).unwrap();

    HttpServer::new(move || {
        let cors = core::server::cors();

        App::new().wrap(cors).service(
            web::scope("/saves")
                .wrap(auth_middleware::Authentication)
                .route("", web::get().to(handlers::get_saves))
                .route("/{save_id}", web::get().to(handlers::get_save))
                .route("", web::post().to(handlers::put_save))
                .route("/{save_id}/rename", web::post().to(handlers::rename_save))
                .route("/{save_id}", web::delete().to(handlers::delete_save)),
        )
    })
    .bind(env::var("LISTEN_URL").unwrap())
    .unwrap()
    .run()
    .await
}
