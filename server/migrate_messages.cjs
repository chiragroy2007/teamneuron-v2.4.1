const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'neuron.db');
const db = new sqlite3.Database(dbPath);

const sql = `
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    receiver_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TEXT, 
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

db.run(sql, (err) => {
    if (err) {
        console.error("Migration failed:", err);
    } else {
        console.log("Messages table created successfully.");
    }
});
