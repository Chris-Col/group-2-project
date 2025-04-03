-- create table: users
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    pw VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- create table: minigames
CREATE TABLE minigames (
    game_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Create table: gameContent
CREATE TABLE gameContent (
    content_id INT PRIMARY KEY AUTO_INCREMENT,
    game_id INT NOT NULL,
    prompt TEXT NOT NULL,
    answer TEXT NOT NULL,
    options JSON, -- Can be used to pass any JSON data to make it usable for each game
    difficulty_level INT NOT NULL,
    FOREIGN KEY (game_id) REFERENCES Minigames(game_id)
        ON DELETE CASCADE
);

-- Create table: userProgress
CREATE TABLE userProgress (
    progress_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    content_id INT NOT NULL,
    attempts INT DEFAULT 0,
    is_correct BOOLEAN DEFAULT FALSE,
    last_played DATETIME DEFAULT CURRENT_TIMESTAMP,
    score INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES Minigames(game_id)
        ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES GameContent(content_id)
        ON DELETE CASCADE
);