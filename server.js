const Fastify = require('fastify');
const { Pool } = require('pg');
require('dotenv').config();

// Initialise Fastify with logging enabled
const app = Fastify({ logger: true });

// Register CORS so the frontend can communicate with this API later
app.register(require('cors'), { origin: '*' });

// Connect to PostgreSQL using the securely injected DATABASE_URL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required by Render for hosted DBs
});

// Initialize database table if it doesn't exist
const initDB = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
};

// READ Logic: Get all tasks
app.get('/api/tasks', async (request, reply) => {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    return result.rows;
});

// WRITE Logic: Add a new task
app.post('/api/tasks', async (request, reply) => {
    const { title } = request.body;
    const result = await pool.query(
        'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
        [title]
    );
    return result.rows[0];
});

// Start the server
const start = async () => {
    try {
        await initDB();
        // Render assigns a dynamic port; fallback to 3000 locally
        const port = process.env.PORT || 3000;
        // Host MUST be '0.0.0.0' for Render, not 'localhost'
        await app.listen({ port: port, host: '0.0.0.0' });
        app.log.info(`Server running on port ${port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();