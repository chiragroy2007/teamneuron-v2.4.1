const { query } = require('./server/dist/db');
async function check() {
    try {
        const res = await query('SELECT * FROM clubs');
        console.log('Clubs count:', res.rows.length);
        console.log('Clubs:', JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error(e);
    }
}
check();
