SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS image_sharing_app;

USE image_sharing_app;
DROP TABLE likes;
DROP TABLE comments;
DROP TABLE photos;
DROP TABLE users;

CREATE TABLE users (
    id int(11) NOT NULL AUTO_INCREMENT,
    username varchar(512) NOT NULL UNIQUE,
    email varchar(512) NOT NULL UNIQUE,
    pwd varchar(256) NOT NULL,
    full_name varchar(255) DEFAULT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE photos (
    id int(11) NOT NULL AUTO_INCREMENT,
    caption varchar(512) DEFAULT NULL,
    alt_text varchar(512) DEFAULT NULL,
    user_id int(11) DEFAULT NULL,
    photo_path varchar(2083) NOT NULL,
  	-- number_likes int(11) NOT NULL DEFAULT '0',
    -- number_comments int(11) NOT NULL DEFAULT '0',
    date_upload datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE comments (
    id int(11) NOT NULL AUTO_INCREMENT,
    user_id int(11) NOT NULL,
    photo_id int(11) NOT NULL,
    content text NOT NULL,
    date_upload datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (photo_id) REFERENCES photos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE likes (
    id int(11) NOT NULL AUTO_INCREMENT,
    user_id int(11) NOT NULL,
    photo_id int(11) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (photo_id) REFERENCES photos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO users
VALUES (1, 'lewis', 'lewis@tcd.ie', 'lewispwd', 'Hewis Hamilton');

INSERT INTO users
VALUES (2, 'anna', 'anna@tcd.ie', 'annapwd', 'Anna Stone');

INSERT INTO photos (id, caption, alt_text, user_id, photo_path)
VALUES (1, 'hello', 'photo', 1, "hello");

INSERT INTO photos (id, caption, alt_text, user_id, photo_path)
VALUES (2, 'hello', 'photo', 1, "hello2");

-- SELECT COUNT(id) AS number_comments FROM comments WHERE photo_id = whatever;
-- SELECT COUNT(id) AS number_likes FROM likes WHERE photo_id = whatever;
-- SELECT COUNT(id) AS number_photos FROM photos WHERE user_id = whatever;

-- SELECT username FROM users JOIN photos ON photos.user_id = users.id AND photos.id = whatever;
