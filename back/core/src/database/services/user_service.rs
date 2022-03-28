use crate::database::models::{NewUser, UpdateUser, User};
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
        username: format!("user-{}", uid),
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

pub fn update_user_username(uid: String, username: String) -> Option<User> {
    let connection = establish_connection();

    if username.is_empty() || username.len() > 256 {
        return None;
    }

    let username_exists = select(exists(users::table.filter(users::username.eq(&username))))
        .get_result(&connection)
        .unwrap();

    if username_exists {
        return None;
    }

    let updated_user = update(users::table.filter(users::uid.eq(&uid)))
        .set(users::username.eq(&username))
        .get_result(&connection)
        .unwrap();

    return Some(updated_user);
}

pub fn update_user(uid: String, update_user: UpdateUser) -> Option<User> {
    let connection = establish_connection();

    let mut something_to_update = false;

    match &update_user.name {
        Some(name) => {
            if name.len() > 256 {
                return None;
            }
            something_to_update = true;
        }
        None => (),
    };

    if something_to_update == false {
        return None;
    }

    let updated_user = update(users::table.filter(users::uid.eq(&uid)))
        .set(&update_user)
        .get_result(&connection)
        .unwrap();

    return Some(updated_user);
}
