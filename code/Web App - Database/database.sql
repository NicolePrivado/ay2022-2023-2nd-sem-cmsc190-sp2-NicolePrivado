CREATE DATABASE uplb_cashier;
CREATE USER 'cashier'@'%' IDENTIFIED BY '2023UPLBCNS';
GRANT ALL PRIVILEGES ON uplb_cashier.* TO 'cashier'@'%';
ALTER USER 'cashier'@'%' IDENTIFIED WITH mysql_native_password BY '2023UPLBCNS';
FLUSH PRIVILEGES;

use uplb_cashier;

CREATE TABLE announcements (
  	id VARCHAR(50) PRIMARY KEY,
	title VARCHAR(150),
	body VARCHAR(300),
	datetime VARCHAR(50),
	timestamp DATETIME,
	hidden TINYINT(1) DEFAULT 0
);

CREATE TABLE inquiries (
  	id VARCHAR(50) PRIMARY KEY,
	email VARCHAR(150),
	content VARCHAR(300),
	name VARCHAR(50),
	timestamp DATETIME,
	user_id VARCHAR(50)
);

CREATE TABLE notices (
  	id VARCHAR(50) PRIMARY KEY,
	registered_name VARCHAR(50),
	account_number VARCHAR(150),
	amount VARCHAR(150),
	particular VARCHAR(150),
	date_credit DATE,
	status VARCHAR(50),
	timestamp_sent DATETIME
);

CREATE TABLE replies (
  	id VARCHAR(50) PRIMARY KEY,
	inquiry_id VARCHAR(50),
	body VARCHAR(300),
	name VARCHAR(50),
	timestamp DATETIME
);

CREATE TABLE users (
	id VARCHAR(50) PRIMARY KEY,
	registered_name VARCHAR(50),
	account_number VARCHAR(150),
	mobile_number VARCHAR(150),
	email VARCHAR(150) UNIQUE, 
	device_token VARCHAR(200)
);