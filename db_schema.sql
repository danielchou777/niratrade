CREATE TABLE
    stock (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name varchar(255) NOT NULL,
        symbol varchar(6) NOT NULL,
        UNIQUE(symbol)
    );

INSERT INTO stock (name, symbol) VALUES ('Daniel Inc.', 'DAN');

CREATE TABLE
    user (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id varchar(64) NOT NULL,
        name varchar(32) NOT NULL,
        email varchar(64) NOT NULL,
        password char(60) NOT NULL,
        balance BIGINT UNSIGNED NOT NULL,
        UNIQUE(user_id),
        UNIQUE(email)
    );

-- main user

INSERT INTO
    user (
        user_id,
        name,
        email,
        password,
        balance
    )
VALUES (
        '44c10eb0-2943-4282-88fc-fa01d1cb6ac0',
        'Daniel',
        'daniel@gmail.com',
        '12345678',
        10000000000
    );

INSERT INTO
    user (
        user_id,
        name,
        email,
        password,
        balance
    )
VALUES (
        '728bd78e-8833-44bb-8488-917b70af4773',
        'test',
        'test@gmail.com',
        '12345678',
        10000000000
    );

CREATE TABLE
    orders (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        order_id varchar(64) NOT NULL,
        symbol varchar(6) NOT NULL,
        user_id varchar(64) NOT NULL,
        price INT UNSIGNED NOT NULL,
        quantity INT UNSIGNED NOT NULL,
        type varchar(8) NOT NULL,
        side varchar(4) NOT NULL,
        status varchar(16) NOT NULL,
        partially_filled INT UNSIGNED NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE(order_id),
        FOREIGN KEY (user_id) REFERENCES user(user_id),
        FOREIGN KEY (symbol) REFERENCES stock(symbol)
    );

CREATE TABLE
    execution (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        execution_id varchar(64) NOT NULL,
        buy_order_id varchar(64) NOT NULL,
        sell_order_id varchar(64) NOT NULL,
        symbol varchar(6) NOT NULL,
        price INT UNSIGNED NOT NULL,
        quantity INT UNSIGNED NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(execution_id),
        FOREIGN KEY (buy_order_id) REFERENCES orders(order_id),
        FOREIGN KEY (sell_order_id) REFERENCES orders(order_id),
        FOREIGN KEY (symbol) REFERENCES stock(symbol)
    );

CREATE TABLE
    user_stock (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id varchar(64) NOT NULL,
        symbol varchar(6) NOT NULL,
        quantity INT UNSIGNED NOT NULL,
        UNIQUE(user_id, symbol),
        FOREIGN KEY (user_id) REFERENCES user(user_id),
        FOREIGN KEY (symbol) REFERENCES stock(symbol)
    );