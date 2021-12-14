use crate::database::models::{NewUser, User};
use crate::database::schema::users;
use chrono::Utc;
use diesel::dsl::*;
use diesel::pg::PgConnection;
use diesel::prelude::*;
use dotenv::dotenv;
use std::env;

// todo: error handling

fn establish_connection() -> PgConnection {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    PgConnection::establish(&database_url).expect(&format!("Error connecting to {}", database_url))
}

pub fn register_user(uid: String) {
    let connection = establish_connection();

    let uid_exists = select(exists(users::table.filter(users::uid.eq(&uid))))
        .get_result(&connection)
        .unwrap();

    if uid_exists {
        return;
    }

    let new_user = NewUser {
        registration_datetime: Utc::now().naive_utc(),
        uid,
    };

    diesel::insert_into(users::table)
        .values(&new_user)
        .execute(&connection)
        .unwrap();
}

pub fn get_user(uid: String) -> Option<User> {
    let connection = establish_connection();

    let user = users::table
        .filter(users::uid.eq(&uid))
        .first::<User>(&connection)
        .optional()
        .unwrap();

    return user;
}
