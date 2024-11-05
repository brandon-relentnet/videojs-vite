// src/features/counter/themeSlice.js
import { createSlice } from '@reduxjs/toolkit';

const themeSlice = createSlice({
  name: 'themer',
  initialState: 'mocha', // Default theme
  reducers: {
    setTheme: (state, action) => action.payload, // Set theme based on payload
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
