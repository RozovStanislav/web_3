const client = require('../../config/database');

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS plants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        city VARCHAR(255) NOT NULL,
        contact VARCHAR(255) NOT NULL
    );
`;

client.query(createTableQuery, (err, res) => {
    if (err) {
        console.error('Error creating table:', err);
    } else {
        console.log('Table created or already exists');
    }
});

const Plant = {
    findAll: async () => {
        const res = await client.query('SELECT * FROM plants');
        return res.rows;
    },
    create: async (name, description, city, contact) => {
        const res = await client.query(
            'INSERT INTO plants (name, description, city, contact) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description, city, contact]
        );
        return res.rows[0];
    },
    update: async (id, name, description, city, contact) => {
        const res = await client.query(
            'UPDATE plants SET name = $1, description = $2, city = $3, contact = $4 WHERE id = $5 RETURNING *',
            [name, description, city, contact, id]
        );
        return res.rows[0];
    },
    delete: async (id) => {
        const res = await client.query(
            'DELETE FROM plants WHERE id = $1',
            [id]
        );
        return res.rowCount > 0;
    },
};

module.exports = Plant;
