// setupDatabase.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./tour_manager.db', (err) => {
    if (err) return console.error(err.message);
    console.log('Connected to the SQLite database to set up schema.');
});

const dbSchema = `
CREATE TABLE IF NOT EXISTS groups (
    group_id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS users_groups (
    user_id INTEGER,
    group_id INTEGER,
    role TEXT NOT NULL DEFAULT 'member',
    PRIMARY KEY (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS tour_days (
    day_id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    day_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    day_date TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Upcoming',
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
    UNIQUE(group_id, day_number)
);
CREATE TABLE IF NOT EXISTS locations (
    location_id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_id INTEGER NOT NULL,
    location_name TEXT NOT NULL,
    address TEXT,
    latitude REAL,
    longitude REAL,
    start_time TEXT,
    end_time TEXT,
    reminder_minutes INTEGER DEFAULT 0, -- <-- NEW COLUMN
    order_in_day INTEGER NOT NULL,
    FOREIGN KEY (day_id) REFERENCES tour_days(day_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    location_id INTEGER NOT NULL,
    event_name TEXT NOT NULL,
    description TEXT,
    estimated_cost_per_unit REAL NOT NULL DEFAULT 0.00,
    event_time TEXT,
    reminder_minutes INTEGER DEFAULT 0,
    FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS expenses (
    expense_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_cost REAL NOT NULL,
    expense_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS deposits (
    deposit_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    deposit_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS announcements (
    announcement_id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    scheduled_for DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS push_tokens (
    token_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
PRAGMA foreign_keys = ON;
`;

db.exec(dbSchema, (err) => {
    if (err) {
        console.error("Error setting up database schema:", err.message);
    } else {
        console.log("Database schema created or verified successfully.");
    }
    db.close((err) => {
        if (err) console.error("Error closing db connection:", err.message);
    });
});