// backend/index.js

// Import necessary modules
const express = require('express');
const mysql = require('mysql2/promise'); // Promise-based MySQL client
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const winston = require('winston'); // For advanced logging
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Configure winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        // Write all logs with level `error` and below to `error.log`
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        // Write all logs with level `info` and below to `combined.log`
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// If not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Middleware setup
app.use(helmet()); // Secure HTTP headers
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// Create a connection pool to the MariaDB database
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', // Should be just the IP address or hostname
    port: process.env.DB_PORT || 3306,        // Specify the port separately
    user: process.env.DB_USER || 'your_db_user',
    password: process.env.DB_PASSWORD || 'your_db_password',
    database: process.env.DB_NAME || 'videojs',
    waitForConnections: true,
    connectionLimit: 10, // Adjust based on your server's capacity and expected traffic
    queueLimit: 0
});

// Define the validation schema for creating a video
const videoSchema = Joi.object({
    title: Joi.string().max(255).required(),
    description: Joi.string().allow('', null),
    src: Joi.string().uri().max(500).required(),
    type: Joi.string().max(100).required(),
    poster: Joi.string().uri().max(500).allow('', null),
    duration: Joi.string().pattern(/^([0-1]?\d|2[0-3]):[0-5]\d:[0-5]\d$/).allow('', null), // HH:MM:SS format
    resolution: Joi.string().max(50).allow('', null),
    size: Joi.number().integer().min(0).allow(null),
    status: Joi.string().valid('active', 'inactive', 'archived').default('active'),
    category: Joi.string().max(100).allow('', null),
    uploaded_by: Joi.number().integer().allow(null)
});

// Define the validation schema for updating a video
const videoUpdateSchema = Joi.object({
    title: Joi.string().max(255),
    description: Joi.string().allow('', null),
    src: Joi.string().uri().max(500),
    type: Joi.string().max(100),
    poster: Joi.string().uri().max(500).allow('', null),
    duration: Joi.string().pattern(/^([0-1]?\d|2[0-3]):[0-5]\d:[0-5]\d$/).allow('', null), // HH:MM:SS format
    resolution: Joi.string().max(50).allow('', null),
    size: Joi.number().integer().min(0).allow(null),
    status: Joi.string().valid('active', 'inactive', 'archived'),
    category: Joi.string().max(100),
    uploaded_by: Joi.number().integer().allow(null)
}).min(1); // Require at least one field to update

// Swagger setup
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Video API',
            version: '1.0.0',
            description: 'API for managing videos',
            contact: {
                name: 'Your Name',
                email: 'your.email@example.com'
            },
            servers: [`http://localhost:${PORT}`]
        }
    },
    apis: ['./index.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * components:
 *   schemas:
 *     Video:
 *       type: object
 *       properties:
 *         video_id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         src:
 *           type: string
 *         type:
 *           type: string
 *         poster:
 *           type: string
 *         duration:
 *           type: string
 *         resolution:
 *           type: string
 *         size:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [active, inactive, archived]
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         category_name:
 *           type: string
 *         uploaded_by_username:
 *           type: string
 */

/**
 * @swagger
 * /api/videos:
 *   get:
 *     summary: Retrieve a list of videos
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category name to filter videos
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of videos per page
 *     responses:
 *       200:
 *         description: A paginated list of videos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 videos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Video'
 *       400:
 *         description: Invalid query parameters.
 *       500:
 *         description: Internal Server Error.
 */

// GET endpoint to fetch all videos with optional category filtering and pagination
app.get('/api/videos', async (req, res) => {
    try {
        const { category, page = 1, limit = 10 } = req.query;

        // Validate and sanitize input
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
            return res.status(400).json({ error: 'Invalid page or limit parameters' });
        }

        // Base SQL query with joins for fetching videos
        let sql = `
            SELECT 
                v.video_id, 
                v.title, 
                v.description, 
                v.src, 
                v.type, 
                v.poster, 
                v.duration, 
                v.resolution, 
                v.size, 
                v.status, 
                v.created_at, 
                v.updated_at,
                c.name AS category_name,
                u.username AS uploaded_by_username
            FROM videos v
            LEFT JOIN categories c ON v.category_id = c.category_id
            LEFT JOIN users u ON v.uploaded_by = u.user_id
        `;
        const params = [];

        // Add WHERE clause if category is specified
        if (category) {
            sql += ' WHERE c.name = ?';
            params.push(category);
        }

        // Clone the SQL for counting total records
        let countSql = `
            SELECT COUNT(*) AS total 
            FROM videos v
            LEFT JOIN categories c ON v.category_id = c.category_id
        `;
        if (category) {
            countSql += ' WHERE c.name = ?';
        }

        // Execute the count query
        const [countRows] = await pool.query(countSql, category ? [category] : []);
        const total = countRows[0].total;

        // Add ORDER BY, LIMIT, OFFSET for pagination
        sql += ' ORDER BY v.created_at DESC LIMIT ? OFFSET ?';
        params.push(limitNum, (pageNum - 1) * limitNum);

        // Execute the main query
        const [rows] = await pool.query(sql, params);

        res.json({
            total,
            page: pageNum,
            limit: limitNum,
            videos: rows
        });
    } catch (error) {
        logger.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /api/videos:
 *   post:
 *     summary: Add a new video
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               src:
 *                 type: string
 *               type:
 *                 type: string
 *               poster:
 *                 type: string
 *               duration:
 *                 type: string
 *               resolution:
 *                 type: string
 *               size:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [active, inactive, archived]
 *               category:
 *                 type: string
 *               uploaded_by:
 *                 type: integer
 *             required:
 *               - title
 *               - src
 *               - type
 *     responses:
 *       201:
 *         description: Video created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       400:
 *         description: Bad Request.
 *       500:
 *         description: Internal Server Error.
 */

// POST endpoint to add a new video
app.post('/api/videos', async (req, res) => {
    logger.info('POST /api/videos');
    try {
        // Validate the request body
        const { error, value } = videoSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const {
            title,
            description,
            src,
            type,
            poster,
            duration,
            resolution,
            size,
            status,
            category,
            uploaded_by
        } = value;

        let category_id = null;

        if (category) {
            // Check if category exists
            const [categoryRows] = await pool.query(
                `SELECT category_id FROM categories WHERE name = ?`,
                [category]
            );

            if (categoryRows.length > 0) {
                category_id = categoryRows[0].category_id;
            } else {
                // Optionally, create the category if it doesn't exist
                const [newCategoryResult] = await pool.query(
                    `INSERT INTO categories (name) VALUES (?)`,
                    [category]
                );
                category_id = newCategoryResult.insertId;
            }
        }

        // Insert the new video into the database
        const [result] = await pool.query(
            `INSERT INTO videos 
            (title, description, src, type, poster, duration, resolution, size, status, category_id, uploaded_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                description,
                src,
                type,
                poster,
                duration,
                resolution,
                size,
                status,
                category_id,
                uploaded_by || null
            ]
        );

        // Retrieve the inserted video with the generated 'video_id'
        const [newVideoRows] = await pool.query(
            `
            SELECT 
                v.video_id, 
                v.title, 
                v.description, 
                v.src, 
                v.type, 
                v.poster, 
                v.duration, 
                v.resolution, 
                v.size, 
                v.status, 
                v.created_at, 
                v.updated_at,
                c.name AS category_name,
                u.username AS uploaded_by_username
            FROM videos v
            LEFT JOIN categories c ON v.category_id = c.category_id
            LEFT JOIN users u ON v.uploaded_by = u.user_id
            WHERE v.video_id = ?
            `,
            [result.insertId]
        );

        const newVideo = newVideoRows[0];

        res.status(201).json(newVideo); // Respond with the created video data
    } catch (error) {
        logger.error('Error adding video:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /api/videos/{video_id}:
 *   delete:
 *     summary: Delete a video by video_id
 *     parameters:
 *       - in: path
 *         name: video_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the video to delete
 *     responses:
 *       200:
 *         description: Video deleted successfully.
 *       400:
 *         description: Invalid video_id parameter.
 *       404:
 *         description: Video not found.
 *       500:
 *         description: Internal Server Error.
 */

// DELETE endpoint to remove a video by video_id
app.delete('/api/videos/:video_id', async (req, res) => {
    try {
        const { video_id } = req.params;

        // Validate video_id
        const videoIdNum = parseInt(video_id, 10);
        if (isNaN(videoIdNum) || videoIdNum < 1) {
            return res.status(400).json({ error: 'Invalid video_id parameter' });
        }

        // Execute the delete query
        const [result] = await pool.query('DELETE FROM videos WHERE video_id = ?', [videoIdNum]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Video not found' });
        }

        res.status(200).json({ message: 'Video deleted successfully' });
    } catch (error) {
        logger.error('Error deleting video:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /api/videos/{video_id}:
 *   put:
 *     summary: Update a video by video_id
 *     parameters:
 *       - in: path
 *         name: video_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the video to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               src:
 *                 type: string
 *               type:
 *                 type: string
 *               poster:
 *                 type: string
 *               duration:
 *                 type: string
 *               resolution:
 *                 type: string
 *               size:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [active, inactive, archived]
 *               category:
 *                 type: string
 *               uploaded_by:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Video updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       400:
 *         description: Bad Request.
 *       404:
 *         description: Video not found.
 *       500:
 *         description: Internal Server Error.
 */

// PUT endpoint to update a video by video_id
app.put('/api/videos/:video_id', async (req, res) => {
    try {
        const { video_id } = req.params;

        // Validate video_id
        const videoIdNum = parseInt(video_id, 10);
        if (isNaN(videoIdNum) || videoIdNum < 1) {
            return res.status(400).json({ error: 'Invalid video_id parameter' });
        }

        // Validate the request body
        const { error, value } = videoUpdateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const {
            title,
            description,
            src,
            type,
            poster,
            duration,
            resolution,
            size,
            status,
            category,
            uploaded_by
        } = value;

        let category_id = null;
        if (category) {
            // Check if category exists
            const [categoryRows] = await pool.query(
                `SELECT category_id FROM categories WHERE name = ?`,
                [category]
            );

            if (categoryRows.length > 0) {
                category_id = categoryRows[0].category_id;
            } else {
                // Optionally, create the category if it doesn't exist
                const [newCategoryResult] = await pool.query(
                    `INSERT INTO categories (name) VALUES (?)`,
                    [category]
                );
                category_id = newCategoryResult.insertId;
            }
        }

        // Build the update query dynamically
        const fields = [];
        const params = [];

        if (title !== undefined) {
            fields.push('title = ?');
            params.push(title);
        }
        if (description !== undefined) {
            fields.push('description = ?');
            params.push(description);
        }
        if (src !== undefined) {
            fields.push('src = ?');
            params.push(src);
        }
        if (type !== undefined) {
            fields.push('type = ?');
            params.push(type);
        }
        if (poster !== undefined) {
            fields.push('poster = ?');
            params.push(poster);
        }
        if (duration !== undefined) {
            fields.push('duration = ?');
            params.push(duration);
        }
        if (resolution !== undefined) {
            fields.push('resolution = ?');
            params.push(resolution);
        }
        if (size !== undefined) {
            fields.push('size = ?');
            params.push(size);
        }
        if (status !== undefined) {
            fields.push('status = ?');
            params.push(status);
        }
        if (category_id !== null) {
            fields.push('category_id = ?');
            params.push(category_id);
        }
        if (uploaded_by !== undefined) {
            fields.push('uploaded_by = ?');
            params.push(uploaded_by);
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No valid fields provided for update' });
        }

        params.push(videoIdNum); // For WHERE clause

        const updateSql = `UPDATE videos SET ${fields.join(', ')} WHERE video_id = ?`;

        const [result] = await pool.query(updateSql, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Retrieve the updated video
        const [updatedVideoRows] = await pool.query(
            `
            SELECT 
                v.video_id, 
                v.title, 
                v.description, 
                v.src, 
                v.type, 
                v.poster, 
                v.duration, 
                v.resolution, 
                v.size, 
                v.status, 
                v.created_at, 
                v.updated_at,
                c.name AS category_name,
                u.username AS uploaded_by_username
            FROM videos v
            LEFT JOIN categories c ON v.category_id = c.category_id
            LEFT JOIN users u ON v.uploaded_by = u.user_id
            WHERE v.video_id = ?
            `,
            [videoIdNum]
        );

        const updatedVideo = updatedVideoRows[0];

        res.status(200).json(updatedVideo); // Respond with the updated video data
    } catch (error) {
        logger.error('Error updating video:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /api/videos/{video_id}:
 *   put:
 *     summary: Update a video by video_id
 *     parameters:
 *       - in: path
 *         name: video_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the video to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               src:
 *                 type: string
 *               type:
 *                 type: string
 *               poster:
 *                 type: string
 *               duration:
 *                 type: string
 *               resolution:
 *                 type: string
 *               size:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [active, inactive, archived]
 *               category:
 *                 type: string
 *               uploaded_by:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Video updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       400:
 *         description: Bad Request.
 *       404:
 *         description: Video not found.
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Retrieve a list of categories
 *     responses:
 *       200:
 *         description: A list of categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category_id:
 *                     type: integer
 *                   name:
 *                     type: string
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Category created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category_id:
 *                   type: integer
 *                 name:
 *                   type: string
 *       400:
 *         description: Bad Request.
 *       500:
 *         description: Internal Server Error.
 */

// GET endpoint to fetch all categories
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT category_id, name FROM categories ORDER BY name ASC');
        res.json(rows);
    } catch (error) {
        logger.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST endpoint to create a new category
app.post('/api/categories', async (req, res) => {
    try {
        const { name } = req.body;

        // Validate input
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ error: 'Category name is required and must be a non-empty string.' });
        }

        // Check if category already exists
        const [existingRows] = await pool.query('SELECT category_id FROM categories WHERE name = ?', [name.trim()]);
        if (existingRows.length > 0) {
            return res.status(400).json({ error: 'Category already exists.' });
        }

        // Insert new category
        const [result] = await pool.query('INSERT INTO categories (name) VALUES (?)', [name.trim()]);
        const newCategory = {
            category_id: result.insertId,
            name: name.trim(),
        };
        res.status(201).json(newCategory);
    } catch (error) {
        logger.error('Error creating category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Error handling middleware (after all routes)
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the Express server
app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server is running on port ${PORT}`);
});
