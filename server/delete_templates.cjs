const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'neuron.db');
const db = new sqlite3.Database(dbPath);

// Based on the inspection, the titles are exact.
// Also removing "synapse mobile" (it was "Synapse Mobile App" in the data, but user said "synapse mobile").
// I will matches partials or exacts. User said "NeuroLink: Brain-Computer Interface", "synapse mobile".
// Checking content: "Synapse Mobile App".

const idsToDelete = [
    "6c9015fe-4442-4d4d-9e80-fdf7faa40276", // NeuroLink
    "66c32b6a-41b1-4491-bb04-8da8e4bdd561", // Synapse Mobile
    "962c6d2c-fb15-4f3c-9612-028012a720bb" // AI Ethics (User said "remove all those template project... etc", usually implies the whole set I just saw)
];

// Actually, I'll delete by ID to be safe
db.serialize(() => {
    const placeholders = idsToDelete.map(() => '?').join(',');
    const sql = `DELETE FROM projects WHERE id IN (${placeholders})`;

    db.run(sql, idsToDelete, function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Deleted ${this.changes} rows from projects.`);
    });
});
