// src/pages/View.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dropdown from '../components/Dropdown';
import VideoItem from '../components/VideoItem'; // Import the new VideoItem component

// Define the API base URL
const API_BASE_URL = 'http://localhost:5000/api'; // Update if using environment variables

function View() {
    // State variables
    const [videos, setVideos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [isLoadingVideos, setIsLoadingVideos] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/categories`);
                // Transform categories to fit Dropdown component format
                const categoryOptions = [
                    { label: 'All Categories', value: '' },
                    ...response.data.map(cat => ({ label: cat.name, value: cat.name })),
                ];
                setCategories(categoryOptions);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setErrorMessage('Failed to load categories.');
            } finally {
                setIsLoadingCategories(false);
            }
        };

        fetchCategories();
    }, [API_BASE_URL]);

    // Fetch videos whenever selectedCategory changes
    useEffect(() => {
        const fetchVideos = async () => {
            setIsLoadingVideos(true);
            try {
                let url = `${API_BASE_URL}/videos`;
                if (selectedCategory) {
                    url += `?category=${encodeURIComponent(selectedCategory)}`;
                }
                const response = await axios.get(url);
                setVideos(response.data.videos);
            } catch (error) {
                console.error('Error fetching videos:', error);
                setErrorMessage('Failed to load videos.');
            } finally {
                setIsLoadingVideos(false);
            }
        };

        fetchVideos();
    }, [selectedCategory, API_BASE_URL]);

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl mb-8 text-center font-bold text-text">View Videos</h1>

            {/* Dropdown for category filter */}
            <div className="w-full max-w-md mx-auto mb-8">
                {isLoadingCategories ? (
                    <p className="text-center text-text">Loading categories...</p>
                ) : (
                    <Dropdown
                        options={categories}
                        onSelect={setSelectedCategory}
                        label="Select a Category"
                        selectedValue={selectedCategory}
                        onBlur={() => { }} // Optional: Implement if needed
                    />
                )}
            </div>

            {/* Display error message if any */}
            {errorMessage && (
                <div className="mb-4 text-red-500 text-center">
                    {errorMessage}
                </div>
            )}

            {/* Videos Grid */}
            <div className="w-full">
                {isLoadingVideos ? (
                    <p className="text-center text-text">Loading videos...</p>
                ) : videos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videos.map(video => (
                            <VideoItem key={video.video_id} video={video} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-text">No videos available in this category.</p>
                )}
            </div>
        </div>
    );
}

export default View;
