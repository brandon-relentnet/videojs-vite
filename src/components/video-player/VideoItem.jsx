// src/components/VideoItem.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import VideoPlayer from './VideoPlayer';

function VideoItem({ video }) {
    // Memoize the options object to prevent unnecessary re-renders
    const memoizedOptions = useMemo(() => ({
        autoplay: video.autoplay || false,
        muted: video.muted || false,
        poster: video.poster || '/subtle_ferns_upscayl_2x_ultrasharp.png', // Ensure this path is correct
    }), [video.autoplay, video.muted, video.poster]);

    return (
        <div key={video.video_id} className="bg-surface0 p-4">
            <VideoPlayer
                src={video.src}
                type={video.type}
                options={memoizedOptions}
                onReady={(player) => {
                    console.log(`Player for video ID ${video.video_id} is ready`);
                }}
                onPlay={() => console.log(`Video ID ${video.video_id} started playing`)}
                onPause={() => console.log(`Video ID ${video.video_id} paused`)}
                onError={(error) => console.error(`Error playing video ID ${video.video_id}:`, error)}
            />
            <h3 className="text-xl mt-2 font-semibold text-text">{video.title}</h3>
            {video.description && <p className="text-sm mt-1 text-text">{video.description}</p>}
            {video.category_name && <p className="text-sm mt-1 text-subtext0"><strong>Category:</strong> {video.category_name}</p>}
        </div>
    );
}

VideoItem.propTypes = {
    video: PropTypes.shape({
        video_id: PropTypes.number.isRequired,
        src: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        autoplay: PropTypes.bool,
        muted: PropTypes.bool,
        poster: PropTypes.string,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        category_name: PropTypes.string,
    }).isRequired,
};

export default VideoItem;
