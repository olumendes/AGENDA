#!/bin/bash

# Update package management system
sudo apt-get update

# Install sqlite3 development libraries
sudo apt-get install -y libsqlite3-dev

# Create necessary directories
mkdir -p ~/agenda/data
mkdir -p ~/agenda/logs

# Initialize database structure
sqlite3 ~/agenda/data/agenda.db <<EOF
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    task TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
EOF

echo "Setup complete!"