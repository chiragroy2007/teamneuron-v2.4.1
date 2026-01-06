const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'neuron.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Checking cv_url in profiles table...\n');

    db.all(`SELECT user_id, username, cv_url FROM profiles WHERE cv_url IS NOT NULL OR cv_url != '' LIMIT 10`, (err, rows) => {
        if (err) {
            console.error('Error:', err.message);
        } else {
            console.log('Profiles with CV URLs:');
            console.log(rows);

            if (rows.length === 0) {
                console.log('\nNo profiles have cv_url set. Checking all profiles...');
                db.all(`SELECT user_id, username, cv_url FROM profiles LIMIT 5`, (err2, rows2) => {
                    if (err2) {
                        console.error('Error:', err2.message);
                    } else {
                        console.log('First 5 profiles:');
                        console.log(rows2);
                    }
                    db.close();
                });
            } else {
                db.close();
            }
        }
    });
});
