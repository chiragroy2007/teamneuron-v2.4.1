const path = require('path');
const sqlite3 = require(path.resolve('./server/node_modules/sqlite3')).verbose();
const dbPath = path.resolve('./server/neuron.db');
const db = new sqlite3.Database(dbPath);

const CLUB_ID = 'iiser-tirupati';
const USER_ID = '12840fb2-cc51-49e0-9731-e66a8d33fefa'; // From user report

db.serialize(() => {
    console.log("--- Inspecting club_members ---");
    db.all("SELECT * FROM club_members WHERE club_id = ?", [CLUB_ID], (err, rows) => {
        if (err) { console.error(err); return; }
        console.log(`Found ${rows.length} members for club ${CLUB_ID}`);
        console.log(JSON.stringify(rows, null, 2));

        if (rows.length > 0) {
            console.log("\n--- Inspecting specific user in club_members ---");
            const member = rows.find(r => r.user_id === USER_ID);
            if (member) {
                console.log("User IS in club_members table:");
                console.log(member);
            } else {
                console.log("User NOT found in returned rows despite rows.length > 0 (Should not happen if we trust filter)");
            }
        }
    });

    console.log("\n--- Inspecting user profile ---");
    db.get("SELECT * FROM profiles WHERE user_id = ?", [USER_ID], (err, row) => {
        if (err) console.error(err);
        if (row) {
            console.log("Profile Found:");
            console.log("user_id:", row.user_id);
            console.log("full_name:", row.full_name);
        } else {
            console.log("Profile NOT FOUND for user", USER_ID);
        }
    });

    console.log("\n--- Testing the Join Query ---");
    const sql = `SELECT cm.*, p.username, p.full_name, p.avatar_url
             FROM club_members cm
             LEFT JOIN profiles p ON cm.user_id = p.user_id
             WHERE cm.club_id = ?`;

    db.all(sql, [CLUB_ID], (err, rows) => {
        if (err) console.error("Join Query Error:", err);
        console.log(`Join Query returned ${rows.length} rows`);
        console.log(JSON.stringify(rows, null, 2));
    });
});
