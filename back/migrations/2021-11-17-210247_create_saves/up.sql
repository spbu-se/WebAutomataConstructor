CREATE TABLE public.saves
(
    id serial primary key,
    name varchar(256) not null,
    save text not null,
    user_id varchar(256) not null,
    
    constraint fk_user_id foreign key(user_id) references users(uid)
);