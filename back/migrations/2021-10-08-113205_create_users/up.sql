CREATE TABLE public.users
(
    uid varchar(256) NOT NULL,
    registration_datetime timestamp without time zone,
    PRIMARY KEY (uid)
);