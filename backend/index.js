// backend/index.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
const cors = require('cors');
app.use(cors());


app.use(bodyParser.json());

// Path to the JSON file
const dataFilePath = path.join(__dirname, 'videos.json');

// Helper function to read the JSON file
const readDataFile = () => {
    if (!fs.existsSync(dataFilePath)) {
        fs.writeFileSync(dataFilePath, JSON.stringify({ videos: [] }));
    }
    const data = fs.readFileSync(dataFilePath);
    return JSON.parse(data);
};

// Helper function to write to the JSON file
const writeDataFile = (data) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// API endpoint to get all videos
app.get('/api/videos', (req, res) => {
    console.log('GET /api/videos');
    try {
        const data = readDataFile();
        res.json(data.videos);
    } catch (error) {
        console.error('Error reading data file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to add a new video
app.post('/api/videos', (req, res) => {
    console.log('POST /api/videos');
    try {
        const newVideo = req.body;
        const data = readDataFile();
        data.videos.push(newVideo);
        writeDataFile(data);
        res.status(201).json(newVideo);
    } catch (error) {
        console.error('Error writing data file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to remove a video by ID
app.delete('/api/videos/:id', (req, res) => {
    console.log(`DELETE /api/videos/${req.params.id}`);
    try {
        const { id } = req.params;
        const data = readDataFile();
        data.videos = data.videos.filter((video) => video.id !== id);
        writeDataFile(data);
        res.status(200).json({ message: 'Video deleted' });
    } catch (error) {
        console.error('Error writing data file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
