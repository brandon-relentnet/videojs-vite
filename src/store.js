// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './store/themeSlice';
import accentReducer from './store/accentSlice';
import fontFamilyReducer from './store/fontFamilySlice';
import { loadState, saveState } from './localStorage';

const preloadedState = loadState();

export const store = configureStore({
    reducer: {
        theme: themeReducer,
        accent: accentReducer,
        fontFamily: fontFamilyReducer,
    },
    preloadedState, // Load initial state from local storage
});

// Save state to local storage whenever the store updates
store.subscribe(() => {
    saveState(store.getState());
});
