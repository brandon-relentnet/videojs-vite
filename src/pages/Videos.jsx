// src/pages/Videos.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from '../api/axiosInstance'; // Updated import if using Axios instance
import Dropdown from '../components/Dropdown';
import VideoPlayer from '../components/VideoPlayer';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// If not using Axios instance, uncomment the following line and comment out the Axios instance import
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function Videos() {
    const [videos, setVideos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    // Define status options
    const statusOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Archived', value: 'archived' },
    ];

    // Fetch categories from backend on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setIsLoadingCategories(true);
        try {
            // If using Axios instance, simply use the relative path
            const response = await axios.get('/categories');
            // If not using Axios instance, use the following line instead:
            // const response = await axios.get(`${API_BASE_URL}/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setErrorMessage('Failed to load categories.');
        } finally {
            setIsLoadingCategories(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            videoTitle: '',
            videoSrc: '',
            selectedCategory: '',
            description: '',
            poster: '',
            duration: '',
            resolution: '',
            size: '',
            status: 'active',
            uploadedBy: '',
        },
        validationSchema: Yup.object({
            videoTitle: Yup.string()
                .max(255, 'Title must be at most 255 characters')
                .required('Title is required'),
            videoSrc: Yup.string()
                .url('Invalid URL format')
                .max(500, 'URL must be at most 500 characters')
                .required('URL is required'),
            selectedCategory: Yup.string()
                .required('Category is required'),
            duration: Yup.string()
                .matches(/^([0-1]?\d|2[0-3]):[0-5]\d:[0-5]\d$/, 'Duration must be in HH:MM:SS format')
                .nullable(),
            size: Yup.number()
                .positive('Size must be a positive number')
                .integer('Size must be an integer')
                .nullable(),
            // Add more validations as needed
        }),
        onSubmit: async (values, { resetForm }) => {
            setIsSubmitting(true);
            setErrorMessage('');
            setSuccessMessage('');
            // Infer video type
            const extension = values.videoSrc.split('.').pop().split('?')[0];
            let type = '';
            switch (extension) {
                case 'mp4':
                    type = 'video/mp4';
                    break;
                case 'webm':
                    type = 'video/webm';
                    break;
                case 'ogg':
                    type = 'video/ogg';
                    break;
                case 'm3u8':
                    type = 'application/x-mpegURL';
                    break;
                default:
                    type = 'video/mp4';
            }

            const newVideo = {
                title: values.videoTitle,
                src: values.videoSrc,
                type: type,
                category: values.selectedCategory,
                description: values.description || null,
                poster: values.poster || null,
                duration: values.duration || null,
                resolution: values.resolution || null,
                size: values.size ? parseInt(values.size, 10) : null,
                status: values.status || 'active',
                uploaded_by: values.uploadedBy ? parseInt(values.uploadedBy, 10) : null,
            };

            try {
                // If using Axios instance, use relative path
                const response = await axios.post('/videos', newVideo);
                // If not using Axios instance, use the following line instead:
                // const response = await axios.post(`${API_BASE_URL}/videos`, newVideo);
                setVideos([...videos, response.data]);
                resetForm();
                setSuccessMessage('Video added successfully.');
            } catch (error) {
                console.error('Error adding video:', error);
                if (error.response && error.response.data && error.response.data.error) {
                    setErrorMessage(error.response.data.error);
                } else {
                    setErrorMessage('Failed to add video. Please try again.');
                }
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            setErrorMessage('Category name cannot be empty.');
            return;
        }

        setIsAddingCategory(true);
        try {
            // If using Axios instance, use relative path
            const response = await axios.post('/categories', {
                name: newCategoryName.trim(),
            });
            // If not using Axios instance, use the following line instead:
            // const response = await axios.post(`${API_BASE_URL}/categories`, { name: newCategoryName.trim() });
            // Update categories list with the new category
            setCategories([...categories, response.data]);
            // Select the newly added category
            formik.setFieldValue('selectedCategory', response.data.name);
            // Reset add category state
            setNewCategoryName('');
            setShowAddCategory(false);
            setErrorMessage('');
            setSuccessMessage(`Category "${response.data.name}" added successfully.`);
        } catch (error) {
            console.error('Error adding category:', error);
            if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage('Failed to add category. Please try again.');
            }
        } finally {
            setIsAddingCategory(false);
        }
    };

    // Memoize video options to prevent unnecessary re-renders
    const videoOptions = useMemo(() => ({
        autoplay: true,
        muted: true,
        poster: formik.values.poster || 'path/to/default-poster.jpg', // Replace with dynamic poster if needed
    }), [formik.values.poster]);

    return (
        <div className="container mx-auto w-10/12 text-text pb-20">
            <div className="rounded my-16 mx-auto">
                <h1 className='text-4xl text-left text-accent font-bold mb-2'>Add New Videos!</h1>
                <p className='text-subtext1 text-left'>Add new videos to the platform by filling in the details below.</p>
            </div>

            {/* Form to enter video details */}
            <div className="container">
                <form onSubmit={formik.handleSubmit}>
                    <div className='container mb-8'>
                        <h2 className='text-2xl text-red text-red font-semibold m-4 text-left'>Required</h2>
                        <div className="p-10 rounded shadow-lg bg-surface0">
                            {/* Title Field */}
                            <div className="mb-4">
                                <label className="text-left block mb-2 font-bold">
                                    Title: <span className="text-accent">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="videoTitle"
                                    value={formik.values.videoTitle}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter video title"
                                    className={`placeholder-subtext1 focus:outline-none focus:ring-0 focus:shadow-lg focus:scale-105 border-none rounded bg-surface1 appearance-none hover:shadow-md transition duration-300 shadow p-2 w-full ${formik.touched.videoTitle && formik.errors.videoTitle ? 'border-red-500' : ''}`}
                                />
                                {formik.touched.videoTitle && formik.errors.videoTitle ? (
                                    <div className="text-red text-sm mt-1">{formik.errors.videoTitle}</div>
                                ) : null}
                            </div>

                            {/* URL Field */}
                            <div className="mb-4">
                                <label className="text-left block mb-2 font-bold">
                                    URL: <span className="text-accent">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="videoSrc"
                                    value={formik.values.videoSrc}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="https://example.com/video.mp4"
                                    className={`placeholder-subtext1 focus:outline-none focus:ring-0 focus:shadow-lg focus:scale-105 border-none rounded bg-surface1 appearance-none hover:shadow-md transition duration-300 shadow p-2 w-full ${formik.touched.videoSrc && formik.errors.videoSrc ? 'border-red-500' : ''}`}
                                />
                                {formik.touched.videoSrc && formik.errors.videoSrc ? (
                                    <div className="text-red text-sm mt-1">{formik.errors.videoSrc}</div>
                                ) : null}
                            </div>

                            {/* Category Selection */}
                            <div className="mb-4">
                                <label className="text-left block mb-2 font-bold">
                                    Category: <span className="text-accent">*</span>
                                </label>
                                {isLoadingCategories ? (
                                    <p>Loading categories...</p>
                                ) : (
                                    <Dropdown
                                        options={categories.map(cat => ({ label: cat.name, value: cat.name }))}
                                        onSelect={(value) => formik.setFieldValue('selectedCategory', value)}
                                        label="Select a Category"
                                        selectedValue={formik.values.selectedCategory}
                                        onBlur={() => formik.setFieldTouched('selectedCategory', true)}
                                    />
                                )}
                                {formik.touched.selectedCategory && formik.errors.selectedCategory ? (
                                    <div className="text-red text-sm mt-1">{formik.errors.selectedCategory}</div>
                                ) : null}
                                {/* Option to add a new category */}
                                <button
                                    type="button"
                                    onClick={() => setShowAddCategory(!showAddCategory)}
                                    className="px-4 py-2 rounded bg-surface2 text-text hover:scale-105 hover:shadow-md hover:bg-accent hover:text-base transition duration-300 mt-2"
                                >
                                    {showAddCategory ? 'Cancel' : 'Add New Category'}
                                </button>
                            </div>

                            {/* Add New Category Input */}
                            {showAddCategory && (
                                <div className="mb-4">
                                    <label className="text-left block mb-2 font-bold">New Category Name:</label>
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="Enter new category name"
                                        className={`focus:outline-none focus:ring-0 focus:shadow-lg focus:scale-105 border-none rounded bg-surface1 appearance-none hover:shadow-md transition duration-300 shadow p-2 w-full ${newCategoryName.trim() === '' ? 'border-red-500' : ''}`}
                                    />
                                    {newCategoryName.trim() === '' && (
                                        <div className="text-red text-sm mt-1">Category name cannot be empty.</div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleAddCategory}
                                        disabled={isAddingCategory}
                                        className="mt-2 shadow hover:scale-105 hover:shadow-md bg-surface0 text-subtext0 px-4 py-2 hover:bg-surface1 transition duration-300 rounded"
                                    >
                                        {isAddingCategory ? 'Creating...' : 'Create Category'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className='container mb-8'>
                        <h2 className='text-2xl text-yellow font-semibold m-4 text-left'>Optional</h2>
                        <div className="p-10 rounded shadow-lg bg-surface0">
                            {/* Description Field */}
                            <div className="mb-4">
                                <label className="text-left block mb-2 font-bold">Description:</label>
                                <textarea
                                    name="description"
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter video description (optional)"
                                    className="placeholder-subtext1 focus:outline-none focus:ring-0 focus:shadow-lg focus:scale-105 border-none rounded bg-surface1 appearance-none hover:shadow-md transition duration-300 shadow p-2 w-full"
                                    rows="3"
                                ></textarea>
                            </div>

                            {/* Poster URL Field */}
                            <div className="mb-4">
                                <label className="text-left block mb-2 font-bold">Poster URL:</label>
                                <input
                                    type="text"
                                    name="poster"
                                    value={formik.values.poster}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="https://example.com/poster.jpg (optional)"
                                    className="placeholder-subtext1 focus:outline-none focus:ring-0 focus:shadow-lg focus:scale-105 border-none rounded bg-surface1 appearance-none hover:shadow-md transition duration-300 shadow p-2 w-full"
                                />
                            </div>

                            {/* Duration Field */}
                            <div className="mb-4">
                                <label className="text-left block mb-2 font-bold">Duration (HH:MM:SS):</label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={formik.values.duration}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="00:00:00 (optional)"
                                    className={`placeholder-subtext1 focus:outline-none focus:ring-0 focus:shadow-lg focus:scale-105 border-none rounded bg-surface1 appearance-none hover:shadow-md transition duration-300 shadow p-2 w-full ${formik.touched.duration && formik.errors.duration ? 'border-red-500' : ''}`}
                                />
                                {formik.touched.duration && formik.errors.duration ? (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.duration}</div>
                                ) : null}
                            </div>

                            {/* Resolution Field */}
                            <div className="mb-4">
                                <label className="text-left block mb-2 font-bold">Resolution:</label>
                                <input
                                    type="text"
                                    name="resolution"
                                    value={formik.values.resolution}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="e.g., 1080p (optional)"
                                    className="placeholder-subtext1 focus:outline-none focus:ring-0 focus:shadow-lg focus:scale-105 border-none rounded bg-surface1 appearance-none hover:shadow-md transition duration-300 shadow p-2 w-full"
                                />
                            </div>

                            {/* Size Field */}
                            <div className="mb-4">
                                <label className="text-left block mb-2 font-bold">Size (MB):</label>
                                <input
                                    type="number"
                                    name="size"
                                    value={formik.values.size}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="e.g., 500 (optional)"
                                    className={`placeholder-subtext1 focus:outline-none focus:ring-0 focus:shadow-lg focus:scale-105 border-none rounded bg-surface1 appearance-none hover:shadow-md transition duration-300 shadow p-2 w-full ${formik.touched.size && formik.errors.size ? 'border-red-500' : ''}`}
                                    min="0"
                                />
                                {formik.touched.size && formik.errors.size ? (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.size}</div>
                                ) : null}
                            </div>

                            {/* Status Field */}
                            <div className="mb-4">
                                <label className="text-left block mb-2 font-bold">
                                    Status: <span className="text-red-500">*</span>
                                </label>
                                <Dropdown
                                    options={statusOptions}
                                    onSelect={(value) => formik.setFieldValue('status', value)}
                                    label="Select Status"
                                    selectedValue={formik.values.status}
                                    onBlur={() => formik.setFieldTouched('status', true)}
                                />
                                {formik.touched.status && formik.errors.status ? (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.status}</div>
                                ) : null}
                            </div>

                            {/* Uploaded By Field */}
                            <div className="mb-4">
                                <label className="text-left block mb-2 font-bold">Uploaded By (User ID):</label>
                                <input
                                    type="number"
                                    name="uploadedBy"
                                    value={formik.values.uploadedBy}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter user ID (optional)"
                                    className="placeholder-subtext1 focus:outline-none focus:ring-0 focus:shadow-lg focus:scale-105 border-none rounded bg-surface1 appearance-none hover:shadow-md transition duration-300 shadow p-2 w-full"
                                    min="1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Display Error or Success Messages */}
                    {errorMessage && (
                        <div className="mb-4 text-red-500">
                            {errorMessage}
                        </div>
                    )}
                    {successMessage && (
                        <div className="mb-4 text-green-500">
                            {successMessage}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-4 py-2 rounded bg-surface2 text-text hover:scale-105 hover:shadow-md hover:bg-accent hover:text-base transition duration-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? 'Adding Video...' : 'Add Video'}
                    </button>
                </form>
            </div>

            {/* Display Added Videos */}
            <div className="w-9/12 mx-auto mt-12">
                {videos.length === 0 ? (
                    <p>No videos added yet.</p>
                ) : (
                    videos.map(video => (
                        <div key={video.video_id} className="mb-8">
                            <VideoPlayer
                                src={video.src}
                                type={video.type}
                                options={videoOptions}
                                onReady={(player) => {
                                    console.log(`Player for video ID ${video.video_id} is ready`);
                                }}
                                onPlay={() => console.log(`Video ID ${video.video_id} started playing`)}
                                onPause={() => console.log(`Video ID ${video.video_id} paused`)}
                                onError={(error) => console.error(`Error playing video ID ${video.video_id}:`, error)}
                            />
                            <h3 className="text-xl mt-2">{video.title}</h3>
                            {video.description && <p>{video.description}</p>}
                            {video.category_name && <p><strong>Category:</strong> {video.category_name}</p>}
                            {video.poster && <p><strong>Poster:</strong> <a href={video.poster} target="_blank" rel="noopener noreferrer">View Poster</a></p>}
                            {video.duration && <p><strong>Duration:</strong> {video.duration}</p>}
                            {video.resolution && <p><strong>Resolution:</strong> {video.resolution}</p>}
                            {video.size && <p><strong>Size:</strong> {video.size} MB</p>}
                            {video.status && <p><strong>Status:</strong> {video.status}</p>}
                            {video.uploaded_by_username && <p><strong>Uploaded By:</strong> {video.uploaded_by_username}</p>}
                            {/* Add more details as needed */}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Videos;
