// src/pages/View.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoPlayer from '../components/VideoPlayer';
import { API_BASE_URL } from '../config';
import Dropdown from '../components/Dropdown';

function View() {
    const [videos, setVideos] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    // Example categories array (ensure it matches the categories used when adding videos)
    const categories = [
        { label: 'All Categories', value: '' },
        { label: 'Education', value: 'education' },
        { label: 'Entertainment', value: 'entertainment' },
        { label: 'News', value: 'news' },
        { label: 'Sports', value: 'sports' },
        { label: 'Music', value: 'music' },
    ];

    // Fetch videos from the backend
    useEffect(() => {
        axios.get(`${API_BASE_URL}/videos`)
            .then((response) => {
                setVideos(response.data);
            })
            .catch((error) => {
                console.error('Error fetching videos:', error);
            });
    }, []);

    // Group videos by category
    const groupedVideos = videos.reduce((acc, video) => {
        const category = video.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(video);
        return acc;
    }, {});

    // Filtered categories based on selectedCategory
    const filteredCategories = selectedCategory
        ? { [selectedCategory]: groupedVideos[selectedCategory] || [] }
        : groupedVideos;

    return (
        <div className="container mx-auto px-4 py-12 text-text">
            <h1 className="text-3xl mb-8 text-center">View Videos</h1>

            {/* Dropdown for category filter */}
            <div className="w-9/12 mx-auto mb-6">
                <Dropdown
                    options={categories}
                    onSelect={setSelectedCategory}
                    label={
                        selectedCategory
                            ? categories.find(cat => cat.value === selectedCategory)?.label
                            : 'Select a Category'
                    }
                    selectedValue={selectedCategory}
                />
            </div>
            {Object.keys(filteredCategories).length > 0 ? (
                Object.entries(filteredCategories).map(([category, vids]) => (

                    <div key={category}>
                        <h2 className="text-2xl font-bold my-4">{category}</h2>
                        <div className="grid grid-cols-3 gap-3.5 bg-surface0 m-4 p-4 rounded shadow-lg">
                            {vids.length > 0 ? (
                                vids.map((video) => (
                                    <div key={video.id} className='shadow'>
                                        <VideoPlayer
                                            src={video.src}
                                            type={video.type}
                                            onReady={(player) => {
                                                console.log('Player is ready:', player);
                                            }}
                                        />
                                    </div>
                                ))
                            ) : (
                                <p>No videos in this category.</p>
                            )}
                        </div>
                    </div>

                ))
            ) : (
                <p>No videos available.</p>
            )}
        </div>
    );
}

export default View;
