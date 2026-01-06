const { query } = require('./server/dist/db');

async function debug() {
    try {
        console.log('--- Users ---');
        const users = await query('SELECT id, email FROM users');
        console.log(users.rows);

        console.log('\n--- Club Members ---');
        const members = await query('SELECT * FROM club_members');
        console.log(members.rows);

        console.log('\n--- Checking specific lookup ---');
        // Check for the first user found
        if (users.rows.length > 0) {
            const uid = users.rows[0].id;
            const cid = 'iiser-tirupati';
            console.log(`Checking club_id=${cid}, user_id=${uid}`);
            const check = await query('SELECT * FROM club_members WHERE club_id = ? AND user_id = ?', [cid, uid]);
            console.log('Result:', check.rows);
        }

    } catch (e) {
        console.error(e);
    }
}

debug();
