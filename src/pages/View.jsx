// src/pages/View.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from '../api/axiosInstance'; // Import the Axios instance
import Dropdown from '../components/Dropdown';
import VideoItem from '../components/VideoItem'; // Import the VideoItem component

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
                const response = await axios.get('/categories'); // Relative path
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
    }, []); // Dependencies array left empty as API_BASE_URL is assumed constant

    // Fetch videos whenever selectedCategory changes
    useEffect(() => {
        const fetchVideos = async () => {
            setIsLoadingVideos(true);
            try {
                let url = '/videos'; // Relative path
                if (selectedCategory) {
                    url += `?category=${encodeURIComponent(selectedCategory)}`;
                }
                const response = await axios.get(url); // Use relative URL
                setVideos(response.data.videos);
            } catch (error) {
                console.error('Error fetching videos:', error);
                setErrorMessage('Failed to load videos.');
            } finally {
                setIsLoadingVideos(false);
            }
        };

        fetchVideos();
    }, [selectedCategory]); // Re-fetch when selectedCategory changes

    // Function to group videos by category_name
    const groupVideosByCategory = (videosList) => {
        return videosList.reduce((groups, video) => {
            const category = video.category_name || 'Uncategorized';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(video);
            return groups;
        }, {});
    };

    // Determine if we should group videos (i.e., "All Categories" is selected)
    const shouldGroup = selectedCategory === '';

    // Grouped videos if needed
    const groupedVideos = shouldGroup ? groupVideosByCategory(videos) : { [selectedCategory || 'Uncategorized']: videos };

    // Debugging: Log groupedVideos to verify structure
    useEffect(() => {
        console.log('Grouped Videos:', groupedVideos);
    }, [groupedVideos]);

    return (
        <div className="container mx-auto w-10/12 text-text pb-20">
            <div className="rounded my-16 mx-auto">
                <h1 className='text-4xl text-left text-accent font-bold mb-2'>View our Streams!</h1>
                <p className='text-subtext1 text-left'>Sort by stream category to view specific cameras.</p>
            </div>

            {/* Dropdown for category filter */}
            
            <div className="w-full max-w-md mb-8">
                <label className='text-left text-subtext1 font-semibold block'>Category:</label>
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

            {/* Videos Sections */}
            <div className="w-full">
                {isLoadingVideos ? (
                    <p className="text-center text-text">Loading videos...</p>
                ) : Object.keys(groupedVideos).length > 0 ? (
                    Object.entries(groupedVideos).map(([category, vids]) => (
                        <section key={category}>
                            {/* Category Header */}
                            <h2 className="text-2xl mb-4 font-semibold text-text">
                                {category}
                            </h2>
                            {/* Videos Grid */}
                            <div className="mb-12 bg-surface0 rounded shadow-lg p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {vids.map(video => (
                                    <VideoItem key={video.video_id} video={video} />
                                ))}
                            </div>
                        </section>
                    ))
                ) : (
                    <p className="text-center text-text">No videos available in this category.</p>
                )}
            </div>
        </div>
    );
}

export default View;
