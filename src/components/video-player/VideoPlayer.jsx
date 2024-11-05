// src/components/VideoPlayer.jsx
import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import VideoElement from './VideoElement';
import videoControls from './VideoControls';

const VideoPlayer = ({ src, type, onReady }) => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);

    const options = {
        controls: true,
        responsive: true,
        fluid: true,
        autoplay: true,
        muted: true,
        controlBar: videoControls,
        sources: [
            {
                src,  // use src passed from the parent
                type, // use type passed from the parent
            },
        ],
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (playerRef.current === null) {
                const videoElement = videoRef.current;

                if (videoElement) {
                    const player = (playerRef.current = videojs(videoElement, options, () => {
                        onReady && onReady(player);
                        console.log('Player initialized');
                    }));
                } else {
                    console.warn('Video element not found');
                }
            }
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
                console.log('Player disposed');
            }
        };
    }, [options, onReady]);

    return <VideoElement ref={videoRef} className="video-js vjs-big-play-centered" />;
};

export default VideoPlayer;
