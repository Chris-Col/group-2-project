-- Table: users (from main branch)
CREATE TABLE IF NOT EXISTS users (
  username VARCHAR(50) PRIMARY KEY,
  email VARCHAR(70) UNIQUE NOT NULL,
  password VARCHAR(60) NOT NULL
);

-- Table: extended users (from HEAD branch)
CREATE TABLE IF NOT EXISTS extended_users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  pw VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: minigames
CREATE TABLE IF NOT EXISTS minigames (
  game_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

-- Table: gameContent
CREATE TABLE IF NOT EXISTS gameContent (
  content_id SERIAL PRIMARY KEY,
  game_id INT NOT NULL,
  prompt TEXT NOT NULL,
  answer TEXT NOT NULL,
  options JSON,
  difficulty_level INT NOT NULL,
  FOREIGN KEY (game_id) REFERENCES minigames(game_id) ON DELETE CASCADE
);

-- Table: userProgress
CREATE TABLE IF NOT EXISTS userProgress (
  progress_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  game_id INT NOT NULL,
  content_id INT NOT NULL,
  attempts INT DEFAULT 0,
  is_correct BOOLEAN DEFAULT FALSE,
  last_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  score INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES extended_users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES minigames(game_id) ON DELETE CASCADE,
  FOREIGN KEY (content_id) REFERENCES gameContent(content_id) ON DELETE CASCADE
);

-- Table: languages
CREATE TABLE IF NOT EXISTS languages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL
);

-- Table: games
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);