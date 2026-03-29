-- Wordle Solver Database Schema
-- Compatible with PostgreSQL 14+ and SQLite

CREATE TABLE IF NOT EXISTS words (
    id          SERIAL PRIMARY KEY,
    word        VARCHAR(5) NOT NULL UNIQUE,
    frequency   FLOAT DEFAULT 1.0,
    source      VARCHAR(50) DEFAULT 'curated',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);

CREATE TABLE IF NOT EXISTS game_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at    TIMESTAMP,
    solved          BOOLEAN DEFAULT FALSE,
    num_guesses     INT,
    target_word     VARCHAR(5)
);

CREATE TABLE IF NOT EXISTS game_guesses (
    id          SERIAL PRIMARY KEY,
    session_id  UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    attempt     INT NOT NULL CHECK (attempt BETWEEN 1 AND 4),
    guess       VARCHAR(5) NOT NULL,
    feedback    VARCHAR(50) NOT NULL,  -- e.g. "green,gray,yellow,green,gray"
    entropy     FLOAT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_guesses_session ON game_guesses(session_id);

-- View: solver performance analytics
CREATE OR REPLACE VIEW solver_stats AS
SELECT
    COUNT(*) as total_games,
    SUM(CASE WHEN solved THEN 1 ELSE 0 END) as solved_games,
    ROUND(AVG(num_guesses)::numeric, 2) as avg_guesses,
    SUM(CASE WHEN num_guesses <= 4 THEN 1 ELSE 0 END) as within_4_guesses
FROM game_sessions
WHERE completed_at IS NOT NULL;
