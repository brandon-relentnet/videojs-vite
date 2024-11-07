// src/components/VideoPlayer.jsx
import React, { useLayoutEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import PropTypes from 'prop-types';

const VideoPlayer = ({
    src,
    type,
    options = {},
    onReady = null,
    onPlay = null,
    onPause = null,
    onError = null,
}) => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);

    // Define default options
    const defaultOptions = {
        controls: true,
        responsive: true,
        fluid: true,
        autoplay: false,
        muted: false,
        controlBar: {
            children: ['playToggle', 'volumePanel', 'fullscreenToggle'],
        },
        sources: [
            {
                src: '',
                type: '',
            },
        ],
        poster: '',
    };

    useLayoutEffect(() => {
        const videoElement = videoRef.current;
        console.log('Video Element:', videoElement); // Debugging line

        if (videoElement) {
            console.log('Video element is present in the DOM:', videoElement.isConnected);
        }

        if (videoElement && videoElement.isConnected && !playerRef.current) {
            // Merge defaultOptions with provided options
            const videoOptions = {
                ...defaultOptions,
                ...options,
                sources: [
                    {
                        src,
                        type,
                        ...options.sources?.[0],
                    },
                ],
                poster: options.poster || defaultOptions.poster,
                autoplay:
                    options.autoplay !== undefined
                        ? options.autoplay
                        : defaultOptions.autoplay,
                muted:
                    options.muted !== undefined
                        ? options.muted
                        : defaultOptions.muted,
            };

            // Initialize the player
            playerRef.current = videojs(videoElement, videoOptions, () => {
                if (onReady) {
                    onReady(playerRef.current);
                }
                console.log('Player initialized for:', videoElement);
            });

            // Attach event listeners
            if (onPlay) {
                playerRef.current.on('play', onPlay);
            }
            if (onPause) {
                playerRef.current.on('pause', onPause);
            }
            if (onError) {
                playerRef.current.on('error', onError);
            }
        } else if (playerRef.current) {
            // Update player sources if src or type changes
            if (playerRef.current.currentSrc() !== src) {
                playerRef.current.src({ src, type });
                console.log(`Updated video source to: ${src}`);
            }

            // Update poster if it changes
            if (options.poster && playerRef.current.poster() !== options.poster) {
                playerRef.current.poster(options.poster);
                console.log(`Updated poster to: ${options.poster}`);
            }

            // Update autoplay if it changes
            if (
                options.autoplay !== undefined &&
                playerRef.current.autoplay() !== options.autoplay
            ) {
                playerRef.current.autoplay(options.autoplay);
                console.log(`Updated autoplay to: ${options.autoplay}`);
            }

            // Update muted if it changes
            if (
                options.muted !== undefined &&
                playerRef.current.muted() !== options.muted
            ) {
                playerRef.current.muted(options.muted);
                console.log(`Updated muted to: ${options.muted}`);
            }
        }

        // Cleanup function
        return () => {
            if (playerRef.current) {
                // Detach event listeners
                if (onPlay) {
                    playerRef.current.off('play', onPlay);
                }
                if (onPause) {
                    playerRef.current.off('pause', onPause);
                }
                if (onError) {
                    playerRef.current.off('error', onError);
                }

                playerRef.current.dispose();
                playerRef.current = null;
                console.log('Player disposed for:', videoElement);
            }
        };
    }, [src, type, options, onReady, onPlay, onPause, onError]);

    return (
        <div className="video-container w-full max-w-lg overflow-hidden rounded">
            <div data-vjs-player>
                <video ref={videoRef} className="video-js vjs-big-play-centered" />
            </div>
        </div>
    );
};

VideoPlayer.propTypes = {
    src: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    options: PropTypes.object,
    onReady: PropTypes.func,
    onPlay: PropTypes.func,
    onPause: PropTypes.func,
    onError: PropTypes.func,
};

export default VideoPlayer;
