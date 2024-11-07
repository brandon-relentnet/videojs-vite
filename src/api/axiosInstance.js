// src/api/axiosInstance.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    // You can add default headers here if needed
    // headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;