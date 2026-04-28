const Fastify = require('fastify');
require('dotenv').config();

// Initialise Fastify with logging enabled
const app = Fastify({ logger: true });

// Register CORS so the frontend can communicate with this API later
app.register(require('cors'), { origin: '*' });

// A simple health-check route
app.get('/api/status', async (request, reply) => {
    return { 
        service: 'FocusFlow API', 
        status: 'operational',
        environment: process.env.NODE_ENV || 'development'
    };
});

// Start the server
const start = async () => {
    try {
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