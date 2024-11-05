// src/components/VideoElement.jsx
import React from 'react';

const VideoElement = React.forwardRef(({ className }, ref) => (
    <div data-vjs-player>
        <video ref={ref} className={className} />
    </div>
));

export default VideoElement;
