-- Up Migration
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
-- Down Migration
DROP TABLE users;