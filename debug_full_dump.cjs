const path = require('path');
const sqlite3 = require(path.resolve('./server/node_modules/sqlite3')).verbose();
const dbPath = path.resolve('./server/neuron.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log(`DB Path: ${dbPath}`);

    db.all("SELECT id, email FROM users", [], (err, rows) => {
        if (err) console.error(err);
        console.log(`\nAll Users (${rows.length}):`);
        console.table(rows);
    });

    db.all("SELECT user_id, username FROM profiles", [], (err, rows) => {
        if (err) console.error(err);
        console.log(`\nAll Profiles (${rows.length}):`);
        console.table(rows);
    });

    db.all("SELECT club_id, user_id FROM club_members", [], (err, rows) => {
        if (err) console.error(err);
        console.log(`\nAll Club Members (${rows.length}):`);
        console.table(rows);
    });
});
