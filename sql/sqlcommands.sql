CREATE TABLE subscribers (
id SERIAL primary key,
first_name VARCHAR(255) NOT NULL,
last_name VARCHAR(255) NOT NULL,
age INT,
city VARCHAR(255),
signatur TEXT,
message VARCHAR(180)
);
