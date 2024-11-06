// src/pages/Videos.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { API_BASE_URL } from '../config';
import Dropdown from '../components/Dropdown';

function Videos() {
    const [videos, setVideos] = useState([]);
    const [videoSrc, setVideoSrc] = useState('');
    const [videoType, setVideoType] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // Example categories array that you can modify later
    const categories = [
        { label: 'Education', value: 'education' },
        { label: 'Entertainment', value: 'entertainment' },
        { label: 'News', value: 'news' },
        { label: 'Sports', value: 'sports' },
        { label: 'Music', value: 'music' },
    ];

    const handleLinkChange = (e) => {
        const url = e.target.value;
        setVideoSrc(url);
        // Infer the video type from the URL extension
        const extension = url.split('.').pop().split('?')[0]; // Handles query parameters
        let type = '';
        switch (extension) {
            case 'mp4':
                type = 'video/mp4';
                break;
            case 'webm':
                type = 'video/webm';
                break;
            case 'ogg':
                type = 'video/ogg';
                break;
            case 'm3u8':
                type = 'application/x-mpegURL';
                break;
            default:
                type = 'video/mp4'; // Default to mp4 if unknown
        }
        setVideoType(type);
    };

    const handleAddVideo = () => {
        if (videoSrc && videoType && selectedCategory) {
            const newVideo = {
                id: uuidv4(), // Unique identifier for the video
                src: videoSrc,
                type: videoType,
                category: selectedCategory,
            };

            axios
                .post('http://localhost:5000/api/videos', newVideo)
                .then((response) => {
                    setVideos([...videos, response.data]);
                    // Clear inputs
                    setVideoSrc('');
                    setVideoType('');
                    setSelectedCategory('');
                })
                .catch((error) => {
                    console.error('Error adding video:', error);
                });
        } else {
            alert('Please provide a valid video URL and select a category.');
        }
    };

    return (
        <div className="container px-4 py-12 text-text text-center">
            <h2 className='text-3xl mb-8'>Add new videos!</h2>
            {/* Form to enter link */}
            <div className="w-9/12 mx-auto mb-6">

                <div className="mb-4">
                    <label className="text-left block mb-2 font-bold">URL:</label>
                    <input
                        type="text"
                        value={videoSrc}
                        onChange={handleLinkChange}
                        placeholder="https://example.com/video.mp4"
                        className="focus:outline-none outline-none focus:ring-0 focus:shadow-lg focus:scale-105 border-2 rounded bg-transparent appearance-none hover:shadow-md transition duration-300 border-accent p-2 w-full"
                    />
                </div>

                {/* Dropdown for category selection */}
                <div className="mb-4">
                    <label className="text-left block mb-2 font-bold">Category:</label>
                    <Dropdown
                        options={categories}
                        onSelect={setSelectedCategory}
                        label={selectedCategory ? categories.find(cat => cat.value === selectedCategory).label : 'Select a Category'}
                        selectedValue={selectedCategory}
                    />
                </div>

                <button
                    onClick={handleAddVideo}
                    className="shadow hover:scale-105 hover:shadow-md bg-surface0 text-subtext0 px-4 py-2 hover:bg-surface1 transition duration-300 rounded"
                >
                    Add Video
                </button>
            </div>
        </div>
    );
}

export default Videos;
