use serde::Serialize;

use crate::database::models::user::User;
use crate::database::schema::saves;

#[derive(Identifiable, Associations, Queryable, Serialize, Debug)]
#[belongs_to(User)]
pub struct Save {
    pub id: i32,
    pub name: String,
    pub save: String,
    pub user_id: String,
}

#[derive(Associations, Insertable, Debug)]
#[belongs_to(User)]
#[table_name = "saves"]
pub struct NewSave {
    pub name: String,
    pub save: String,
    pub user_id: String,
}

#[derive(Associations, Queryable, Serialize, Debug)]
#[belongs_to(User)]
#[table_name = "saves"]
pub struct ReadSave {
    pub id: i32,
    pub name: String,
    pub user_id: String,
}
