use std::env;

use diesel::dsl::*;
use diesel::pg::PgConnection;
use diesel::prelude::*;
use dotenv::dotenv;

use crate::database::models::{NewSave, ReadSave, Save};
use crate::database::schema::saves;

fn establish_connection() -> PgConnection {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    PgConnection::establish(&database_url).expect(&format!("Error connecting to {}", database_url))
}

pub fn select_save(user_id: &str, save_id: i32) -> Option<Save> {
    let connection = establish_connection();

    let save = saves::table
        .find(save_id)
        .filter(saves::user_id.eq(user_id))
        .first(&connection)
        .optional()
        .unwrap();

    save
}

pub fn select_user_saves(user_id: &str) -> Vec<ReadSave> {
    let connection = establish_connection();

    let saves = saves::table
        .select((saves::id, saves::name, saves::user_id))
        .filter(saves::user_id.eq(user_id))
        .load::<ReadSave>(&connection)
        .unwrap();

    saves
}

pub fn select_save_by_name(user_id: &str, name: &str) -> Option<Save> {
    let connection = establish_connection();

    let save = saves::table
        .filter(saves::name.eq(name))
        .filter(saves::user_id.eq(user_id))
        .first(&connection)
        .optional()
        .unwrap();

    save
}

pub fn insert_save(user_id: String, name: String, save: String) {
    let new_user = NewSave {
        name,
        save,
        user_id,
    };

    let connection = establish_connection();

    insert_into(saves::table)
        .values(new_user)
        .execute(&connection)
        .unwrap();
}

pub fn update_save_save(save_id: i32, save: &str) {
    let connection = establish_connection();

    update(saves::table.filter(saves::id.eq(save_id)))
        .set(saves::save.eq(save))
        .execute(&connection)
        .unwrap();
}

pub fn update_save_name(save_id: i32, name: &str) {
    let connection = establish_connection();

    update(saves::table.filter(saves::id.eq(save_id)))
        .set(saves::name.eq(name))
        .execute(&connection)
        .unwrap();
}

pub fn delete_save(save_id: i32) {
    let connection = establish_connection();

    delete(saves::table.filter(saves::id.eq(save_id)))
        .execute(&connection)
        .unwrap();
}
