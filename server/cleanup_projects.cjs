const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'neuron.db');
const db = new sqlite3.Database(dbPath);

const titlesToDelete = ['NeuroLink: Brain-Computer Interface', 'synapse mobile'];

db.serialize(() => {
    db.all("SELECT id, title, kind FROM projects", [], (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log("Current Projects:", JSON.stringify(rows, null, 2));

        // Deletion
        db.run("DELETE FROM projects WHERE title IN (?, ?)", titlesToDelete, function (err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`Row(s) deleted: ${this.changes}`);

            db.all("SELECT id, title, kind FROM projects", [], (err, rows) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log("Remaining Projects:", JSON.stringify(rows, null, 2));
            });
        });
    });
});
