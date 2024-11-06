// src/pages/View.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoPlayer from '../components/VideoPlayer';
import { API_BASE_URL } from '../config';

function View() {
    const [videos, setVideos] = useState([]);

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

    return (
        <div className="container mx-auto px-4 py-12 text-text">
            <h1>View Videos</h1>
            {videos.length > 0 ? (
                videos.map((video) => (
                    <div key={video.id} className="mb-6">
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
                <p>No videos added yet.</p>
            )}
        </div>
    );
}

export default View;
