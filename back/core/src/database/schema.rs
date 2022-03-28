table! {
    saves (id) {
        id -> Int4,
        name -> Varchar,
        save -> Text,
        user_id -> Varchar,
    }
}

table! {
    users (uid) {
        uid -> Varchar,
        registration_datetime -> Nullable<Timestamp>,
        username -> Varchar,
        name -> Nullable<Varchar>,
    }
}

joinable!(saves -> users (user_id));

allow_tables_to_appear_in_same_query!(saves, users,);
