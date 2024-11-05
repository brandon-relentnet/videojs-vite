// src/pages/Videos.jsx
import React from 'react';
import VideoPlayer from '../components/video-player/VideoPlayer';

function Videos() {
    const handlePlayerReady = (player) => {
        console.log('Player is ready:', player);

        // Example: Add custom event listeners or controls
        player.on('ended', () => {
            console.log('Video ended');
        });
    };
    return (
        <div className="container mx-auto px-4 py-12 text-text">
            <h1>Custom Video.js Player</h1>
            <VideoPlayer
                src="/dollartree.mp4"  // Pass source URL here
                type="video/mp4"       // Pass video type here
                onReady={handlePlayerReady}
            />
        </div>
    );
}

export default Videos;



