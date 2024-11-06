// src/store/videosSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    videos: [], // Array to store video objects { id, src, type }
};

const videosSlice = createSlice({
    name: 'videos',
    initialState,
    reducers: {
        addVideo: (state, action) => {
            state.videos.push(action.payload);
        },
        removeVideo: (state, action) => {
            state.videos = state.videos.filter((video) => video.id !== action.payload);
        },
    },
});

export const { addVideo, removeVideo } = videosSlice.actions;
export default videosSlice.reducer;
