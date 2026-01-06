const { query } = require('./server/dist/db');

async function seed() {
    try {
        console.log('Checking for IISER Tirupati Research Club...');

        const clubId = 'iiser-tirupati';
        const existing = await query('SELECT * FROM clubs WHERE id = ?', [clubId]);

        if (existing && existing.rows && existing.rows.length > 0) {
            console.log('Club already exists.');
        } else {
            console.log('Club not found. Creating...');
            await query(`
                INSERT INTO clubs (id, name, slug, description, logo_url, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [
                clubId,
                'IISER Tirupati Research Club',
                'iiser-tirupati',
                'A research club for IISER Tirupati students and faculty to collaborate on scientific projects, share knowledge, and discuss the latest research developments.',
                '/images/iiser-tirupati-logo.png'
            ]);
            console.log('Club created successfully.');
        }

        // Verify
        const verify = await query('SELECT * FROM clubs');
        console.log('Total Clubs:', verify.rows.length);
        console.log(verify.rows);

    } catch (error) {
        console.error('Seed error:', error);
    }
}

seed();
