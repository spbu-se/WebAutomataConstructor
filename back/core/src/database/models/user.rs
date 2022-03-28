use crate::database::schema::users;
use chrono::NaiveDateTime;
use serde::{Serialize, Deserialize};

#[derive(Queryable, Debug, Serialize)]
pub struct User {
    pub uid: String,
    pub registration_datetime: Option<NaiveDateTime>,
    pub username: String,
    pub name: Option<String>,
}

#[derive(Insertable, Debug)]
#[table_name = "users"]
pub struct NewUser {
    pub uid: String,
    pub registration_datetime: NaiveDateTime,
    pub username: String,
}

#[derive(Debug, AsChangeset, Deserialize)]
#[table_name = "users"]
pub struct UpdateUser {
    pub name: Option<String>,
}
