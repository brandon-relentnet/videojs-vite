// src/components/VideoPlayer.jsx
import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const VideoPlayer = ({ src, type, onReady }) => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        const videoElement = videoRef.current;

        if (videoElement && !playerRef.current) {
            // Initialize the player
            playerRef.current = videojs(
                videoElement,
                {
                    controls: true,
                    responsive: true,
                    fluid: true,
                    autoplay: true,
                    muted: true,
                    controlBar: {
                        children: ['playToggle', 'volumePanel', 'fullscreenToggle'],
                    },
                    sources: [
                        {
                            src,
                            type,
                        },
                    ],
                },
                () => {
                    if (onReady) {
                        onReady(playerRef.current);
                    }
                    console.log('Player initialized');
                }
            );
        } else if (playerRef.current) {
            // Update the player source if src or type changes
            playerRef.current.src({ src, type });
        }

        // Cleanup function
        return () => {
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
                console.log('Player disposed');
            }
        };
    }, [src, type]); // Removed 'onReady' from dependencies

    return (
        <div data-vjs-player>
            <video ref={videoRef} className="video-js vjs-big-play-centered" />
        </div>
    );
};

export default VideoPlayer;
