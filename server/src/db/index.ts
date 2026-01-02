import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(__dirname, '../../neuron.db');
const schemaPath = path.join(__dirname, 'schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
        initDb();
    }
});

export const query = (text: string, params: any[] = []): Promise<{ rows: any[], lastID?: number }> => {
    return new Promise((resolve, reject) => {
        // Determine if it's a SELECT or a modification
        const isSelect = text.trim().toLowerCase().startsWith('select');

        if (isSelect) {
            db.all(text, params, (err, rows) => {
                if (err) reject(err);
                else resolve({ rows });
            });
        } else {
            db.run(text, params, function (err) {
                if (err) reject(err);
                else resolve({ rows: [], lastID: this.lastID });
            });
        }
    });
};

export const get = (text: string, params: any[] = []): Promise<any> => {
    return new Promise((resolve, reject) => {
        db.get(text, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

const initDb = () => {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    // SQLite executes one statement at a time generally with run, but exec handles scripts
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error initializing database schema', err);
        } else {
            console.log('Database schema initialized');
        }
    });
};

export default db;
