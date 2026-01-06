const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../neuron.db');
const db = new sqlite3.Database(dbPath);

const createTable = `
CREATE TABLE IF NOT EXISTS hypes (
    id TEXT PRIMARY KEY,
    count INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

const insertInitial = `
INSERT OR IGNORE INTO hypes (id, count) VALUES ('synapse', 0);
`;

db.serialize(() => {
    db.run(createTable, (err) => {
        if (err) {
            console.error('Error creating table:', err);
        } else {
            console.log('Hypes table created or already exists.');
        }
    });

    db.run(insertInitial, (err) => {
        if (err) {
            console.error('Error inserting initial row:', err);
        } else {
            console.log('Initial Synapse hype row ensured.');
        }
    });
});

db.close();
