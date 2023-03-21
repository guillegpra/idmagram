SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS image_sharing_app;

USE image_sharing_app;

CREATE TABLE users (
    id int(11) NOT NULL,
    username varchar(512) NOT NULL,
    email varchar(512) NOT NULL,
    pwd varchar(256) NOT NULL,
    first_name varchar(255) DEFAULT NULL,
    last_name varchar(255) DEFAULT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE photos (
    id int(11) NOT NULL,
    caption varchar(512) DEFAULT NULL,
    alt_text varchar(512) DEFAULT NULL,
    user_id int(11) DEFAULT NULL,
  	-- number_likes int(11) NOT NULL DEFAULT '0',
    -- number_comments int(11) NOT NULL DEFAULT '0',
    date_upload datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE comments (
    id int(11) NOT NULL,
    user_id int(11) NOT NULL,
    photo_id int(11) NOT NULL,
    content text NOT NULL,
    date_upload datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (photo_id) REFERENCES photos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE likes (
    id int(11) NOT NULL,
    user_id int(11) NOT NULL,
    photo_id int(11) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (photo_id) REFERENCES photos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO users
VALUES (1, 'lewis', 'lewis@tcd.ie', 'lewispwd', 'Hewis', 'Hamilton');

INSERT INTO users
VALUES (2, 'anna', 'anna@tcd.ie', 'annapwd', 'Anna', 'Stone');

INSERT INTO photos (id, caption, alt_text, user_id)
VALUES (1, 'hello', 'photo', 1);

INSERT INTO photos (id, caption, alt_text, user_id)
VALUES (2, 'hello', 'photo', 1);

-- SELECT COUNT(id) AS number_comments FROM comments WHERE photo_id = whatever;
-- SELECT COUNT(id) AS number_likes FROM likes WHERE photo_id = whatever;
-- SELECT COUNT(id) AS number_photos FROM photos WHERE user_id = whatever;

-- SELECT username FROM users JOIN photos ON photos.user_id = users.id AND photos.id = whatever;
