// backend/index.js

// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // Promise-based MySQL client
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = 5000;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Create a connection pool to the MariaDB database
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', // Should be just the IP address or hostname
    port: process.env.DB_PORT || 3306,        // Specify the port separately
    user: process.env.DB_USER || 'your_db_user',
    password: process.env.DB_PASSWORD || 'your_db_password',
    database: process.env.DB_NAME || 'videojs',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// GET endpoint to fetch all videos
app.get('/api/videos', async (req, res) => {
    console.log('GET /api/videos');
    try {
        // Execute the query to fetch all videos
        const [rows] = await pool.query('SELECT * FROM videos');
        res.json(rows); // Send the result as JSON
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST endpoint to add a new video
app.post('/api/videos', async (req, res) => {
    console.log('POST /api/videos');
    try {
        const { id, src, type, category } = req.body;

        // Basic input validation
        if (!id || !src || !type || !category) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Insert the new video into the database
        await pool.query(
            'INSERT INTO videos (id, src, type, category) VALUES (?, ?, ?, ?)',
            [id, src, type, category]
        );

        res.status(201).json(req.body); // Respond with the created video data
    } catch (error) {
        console.error('Error adding video:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE endpoint to remove a video by ID
app.delete('/api/videos/:id', async (req, res) => {
    console.log(`DELETE /api/videos/${req.params.id}`);
    try {
        const { id } = req.params;

        // Delete the video from the database
        await pool.query('DELETE FROM videos WHERE id = ?', [id]);

        res.status(200).json({ message: 'Video deleted' });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the Express server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
