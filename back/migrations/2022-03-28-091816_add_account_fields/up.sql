ALTER TABLE users
ADD COLUMN username VARCHAR(256),
ADD COLUMN name VARCHAR(256);

UPDATE users
SET username = 'user-' || uid;

ALTER TABLE users
ALTER COLUMN username SET NOT NULL;