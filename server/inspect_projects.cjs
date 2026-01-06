const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'neuron.db');
const db = new sqlite3.Database(dbPath);

console.log("Inspecting 'projects' table schema...");
db.all("PRAGMA table_info(projects)", [], (err, rows) => {
    if (err) {
        console.error("Error getting schema:", err);
        return;
    }
    console.log(JSON.stringify(rows, null, 2));

    db.all("SELECT * FROM projects LIMIT 5", [], (err, rows) => {
        if (err) {
            console.error("Error selecting rows:", err);
            return;
        }
        console.log("Sample Data:", JSON.stringify(rows, null, 2));
    });
});
