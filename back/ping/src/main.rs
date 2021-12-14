use actix_web::{web, App, HttpServer};
use log::Level;
use std::env;

mod auth_middleware;
mod ping_handler;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Hello, world!");
    dotenv::dotenv().unwrap();
    simple_logger::init_with_level(Level::Debug).unwrap();

    HttpServer::new(move || {
        let cors = core::server::cors();

        App::new().wrap(cors).service(
            web::scope("/ping")
                .wrap(auth_middleware::Authentication)
                .route("", web::get().to(ping_handler::ping_handler)),
        )
    })
    .bind(env::var("LISTEN_URL").unwrap())
    .unwrap()
    .run()
    .await
}
