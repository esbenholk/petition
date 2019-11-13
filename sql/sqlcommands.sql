DROP TABLE IF EXISTS subscribers;
DROP TABLE IF EXISTS registration;
DROP TABLE IF EXISTS user_profiles;


CREATE TABLE subscribers (
id SERIAL primary key,
message VARCHAR(180) CHECK (message != ''),
signature TEXT NOT NULL CHECK (signature != ''),
user_id INTEGER
);

CREATE TABLE registration (
id SERIAL primary key,
firstname VARCHAR(255) NOT NULL CHECK (firstname != ''),
lastname VARCHAR(255) NOT NULL CHECK (lastname != ''),
email VARCHAR(180) NOT NULL CHECK (email != '') UNIQUE,
password TEXT NOT NULL CHECK (password != '')
);

CREATE TABLE user_profiles(
    id SERIAL PRIMARY KEY,
    age INT,
    city VARCHAR,
    url VARCHAR,
    user_profiles_id INT REFERENCES registration(id) NOT NULL UNIQUE
);
