// src/mimeTypes.js
export const MIME_TYPES = {
    // Video Types
    opus: 'video/ogg',
    ogv: 'video/ogg',
    mp4: 'video/mp4',
    mov: 'video/mp4',
    m4v: 'video/mp4',
    mkv: 'video/x-matroska',
    m3u8: 'application/x-mpegURL',
    mpd: 'application/dash+xml',

    // Audio Types
    m4a: 'audio/mp4',
    mp3: 'audio/mpeg',
    aac: 'audio/aac',
    caf: 'audio/x-caf',
    flac: 'audio/flac',
    oga: 'audio/ogg',
    wav: 'audio/wav',

    // Image Types
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    png: 'image/png',
    svg: 'image/svg+xml',
    webp: 'image/webp',
};

/**
 * Extracts and returns the MIME type based on the file extension from a given URL.
 * @param {string} url - The URL of the file.
 * @returns {string} - The corresponding MIME type or a default fallback.
 */
export const getMimeType = (url) => {
    if (!url) return 'application/octet-stream';
    const extension = url.split('.').pop().split('?')[0].toLowerCase();
    return MIME_TYPES[extension] || 'application/octet-stream'; // Default fallback
};
