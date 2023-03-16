SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE TABLE users (
    id int(11) NOT NULL PRIMARY KEY,
    username varchar(512) NOT NULL,
    email varchar(512) NOT NULL,
    pwd varchar(256) NOT NULL,
    first_name varchar(255) DEFAULT NULL,
    last_name varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE photos (
    id int(11) NOT NULL PRIMARY KEY,
    caption varchar(512) DEFAULT NULL,
    user_id int(11) DEFAULT NULL,
  	number_likes int(11) NOT NULL DEFAULT '0',
    number_comments int(11) NOT NULL DEFAULT '0',
    date_upload datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE comments (
    id int(11) NOT NULL,
    user_id int(11) NOT NULL,
    photo_id int(11) NOT NULL,
    content text NOT NULL,
    date_upload datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
