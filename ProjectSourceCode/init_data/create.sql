-- create table: users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    pw VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- create table: minigames
CREATE TABLE minigames (
    game_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Create table: gameContent
CREATE TABLE gameContent (
    content_id SERIAL PRIMARY KEY,
    game_id INT NOT NULL,
    prompt TEXT NOT NULL,
    answer TEXT NOT NULL,
    options JSON, -- Can be used to pass any JSON data to make it usable for each game
    difficulty_level INT NOT NULL,
    FOREIGN KEY (game_id) REFERENCES minigames(game_id)
        ON DELETE CASCADE
);

-- Create table: userProgress
CREATE TABLE userProgress (
    progress_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    lang VARCHAR(30) NOT NULL,
    lev INT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES minigames(game_id)
        ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES GameContent(content_id)
        ON DELETE CASCADE
);