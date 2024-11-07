// src/main.jsx
if (process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;
  console.warn = (message, ...args) => {
    if (typeof message === 'string' && message.includes('React Router will begin wrapping state updates')) {
      return; // Suppress only this specific warning
    }
    originalWarn(message, ...args);
  };
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './css/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
);
