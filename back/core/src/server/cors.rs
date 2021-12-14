use actix_cors::Cors;

pub fn cors() -> Cors {
    Cors::default()
        .allow_any_origin()
        .allowed_methods(vec!["GET", "POST", "OPTIONS", "DELETE"])
        .allow_any_header()
        .max_age(3600)
}
