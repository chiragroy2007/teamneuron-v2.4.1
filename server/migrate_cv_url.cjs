const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'neuron.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Adding cv_url column to profiles table...');

    db.run(`ALTER TABLE profiles ADD COLUMN cv_url TEXT`, (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Column cv_url already exists');
            } else {
                console.error('Error adding cv_url column:', err.message);
            }
        } else {
            console.log('Successfully added cv_url column');
        }
    });
});

db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('Database connection closed');
    }
});
