const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'neuron.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Checking users table structure...\n');

    // First, let's see the current structure
    db.all(`PRAGMA table_info(users)`, (err, columns) => {
        if (err) {
            console.error('Error:', err.message);
            db.close();
            return;
        }

        console.log('Current users table columns:');
        console.log(columns);

        // Check if is_admin column exists
        const hasIsAdmin = columns.some(col => col.name === 'is_admin');

        if (hasIsAdmin) {
            console.log('\nis_admin column exists, updating...');
            db.run(`UPDATE users SET is_admin = 1 WHERE email = 'chiragofficial2007@gmail.com'`, (err) => {
                if (err) {
                    console.error('Error updating:', err.message);
                } else {
                    console.log('Successfully set is_admin = 1');

                    // Verify
                    db.get(`SELECT id, email, is_admin FROM users WHERE email = 'chiragofficial2007@gmail.com'`, (err2, row) => {
                        if (err2) {
                            console.error('Error verifying:', err2.message);
                        } else {
                            console.log('\nVerification:');
                            console.log(row);
                        }
                        db.close();
                    });
                }
            });
        } else {
            console.log('\nis_admin column does not exist, adding it...');
            db.run(`ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0`, (err) => {
                if (err) {
                    console.error('Error adding column:', err.message);
                    db.close();
                } else {
                    console.log('Column added, now updating user...');
                    db.run(`UPDATE users SET is_admin = 1 WHERE email = 'chiragofficial2007@gmail.com'`, (err2) => {
                        if (err2) {
                            console.error('Error updating:', err2.message);
                        } else {
                            console.log('Successfully set is_admin = 1');

                            // Verify
                            db.get(`SELECT id, email, is_admin FROM users WHERE email = 'chiragofficial2007@gmail.com'`, (err3, row) => {
                                if (err3) {
                                    console.error('Error verifying:', err3.message);
                                } else {
                                    console.log('\nVerification:');
                                    console.log(row);
                                }
                                db.close();
                            });
                        }
                    });
                }
            });
        }
    });
});
