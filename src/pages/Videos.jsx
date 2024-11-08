// src/pages/Videos.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from '../api/axiosInstance'; // Updated import if using Axios instance
import Dropdown from '../components/Dropdown';
import VideoPlayer from '../components/video-player/VideoPlayer';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { MIME_TYPES, getMimeType } from '../components/video-player/mimeTypes'; // Ensure getMimeType is imported
import PageHeaders from '../components/PageHeaders';
import { useStyles } from '../css/Styles';
import { CSSTransition } from 'react-transition-group';
import '../css/transitions.css'; // Ensure this path is correct

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
    const styles = useStyles();
    const addCategoryRef = useRef(null); // Create a ref for CSSTransition

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
                .required('URL is required')
                .test('is-supported', 'Unsupported file type', (value) => {
                    if (!value) return false;
                    const mimeType = getMimeType(value);
                    return Object.values(MIME_TYPES).includes(mimeType);
                }),
            selectedCategory: Yup.string().required('Category is required'),
            duration: Yup.string()
                .matches(/^([0-1]?\d|2[0-3]):[0-5]\d:[0-5]\d$/, 'Duration must be in HH:MM:SS format')
                .nullable(),
            size: Yup.number()
                .positive('Size must be a positive number')
                .integer('Size must be an integer')
                .nullable(),
            // Add more validations as needed
        }),
        validateOnBlur: false, // Disable automatic blur validation for all fields
        validateOnChange: false, // Disable automatic change validation for all fields
        onSubmit: async (values, { resetForm }) => {
            setIsSubmitting(true);
            setErrorMessage('');
            setSuccessMessage('');

            // Use getMimeType to determine the MIME type
            const type = getMimeType(values.videoSrc);

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
        <div className={`${styles.page}`}>
            <PageHeaders title="Videos" description="Add, view, and manage videos." />

            {/* Form to enter video details */}
            <div className="container">
                <form onSubmit={formik.handleSubmit}>
                    <div className='container mb-8'>
                        <h2 className={`${styles.sectionHeader} text-red`}>Required</h2>
                        <div className={`${styles.sectionBlocks}`}>
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
                                    className={`${styles.input}`}
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
                                    className={`${styles.input}`}
                                />
                                {formik.touched.videoSrc && formik.errors.videoSrc ? (
                                    <div className="text-red text-sm mt-1">{formik.errors.videoSrc}</div>
                                ) : null}
                            </div>

                            {/* Category Selection */}
                            <div className='mb-4'>
                                <label className="text-left block mb-2 font-bold">
                                    Category: <span className="text-accent">*</span>
                                </label>
                                <div className='flex justify-between items-center'>
                                    <div className='flex w-7/12'>
                                        <div className='w-full'>
                                            {isLoadingCategories ? (
                                                <p>Loading categories...</p>
                                            ) : (
                                                <Dropdown
                                                    options={categories.map(cat => ({ label: cat.name, value: cat.name }))}
                                                    onSelect={(value) => {
                                                        formik.setFieldValue('selectedCategory', value);
                                                        formik.setFieldTouched('selectedCategory', true, false);
                                                    }}
                                                    label="Select a Category"
                                                    selectedValue={formik.values.selectedCategory}
                                                    onClose={() => {
                                                        if (!formik.values.selectedCategory) {
                                                            formik.setFieldTouched('selectedCategory', true);
                                                            formik.validateField('selectedCategory');
                                                        }
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <div>
                                            {/* Option to add a new category */}
                                            <button
                                                type="button"
                                                onClick={() => setShowAddCategory(!showAddCategory)}
                                                className={`${styles.button} ml-4`}
                                                aria-expanded={showAddCategory}
                                                aria-controls="add-category-section"
                                            >
                                                {showAddCategory ? 'Cancel' : '+'}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`${styles.button} mr-6 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isSubmitting ? 'Adding Video...' : 'Add Video'}
                                        </button>
                                    </div>
                                </div>
                                {formik.touched.selectedCategory && formik.errors.selectedCategory ? (
                                    <div className="-mt-3 mb-3 text-red text-sm">{formik.errors.selectedCategory}</div>
                                ) : null}
                            </div>

                            {/* Add New Category Input with Slide-Down Animation */}
                            <CSSTransition
                                in={showAddCategory}
                                timeout={300}
                                classNames="slide-down"
                                unmountOnExit
                                nodeRef={addCategoryRef} // Pass the ref here
                            >
                                <div ref={addCategoryRef} className='mt-4 flex justify-center' id="add-category-section">
                                    <div className='mt-6 flex flex-col items-center justify-center shadow-xl rounded bg-surface1 w-9/12 p-6'>
                                        <label className="text-left block mb-2 font-bold">New Category Name:</label>
                                        <input
                                            type="text"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            placeholder="Enter new category name"
                                            className={`${styles.input} mb-1 ${newCategoryName.trim() === '' ? 'border-red' : ''}`}
                                        />
                                        {newCategoryName.trim() === '' && (
                                            <div className="text-red text-sm mb-1">Category name cannot be empty.</div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleAddCategory}
                                            disabled={isAddingCategory}
                                            className={`${styles.button}`}
                                        >
                                            {isAddingCategory ? 'Creating...' : 'Create Category'}
                                        </button>
                                    </div>
                                </div>
                            </CSSTransition>
                        </div>
                    </div>

                    {/* Optional Fields */}
                    <div className='container mb-8'>
                        <h2 className={`${styles.sectionHeader} text-yellow`}>Optional</h2>
                        <div className={`${styles.sectionBlocks}`}>
                            {/* Description Field */}
                            <div className="mb-4">
                                <label className="text-left block mb-2 font-bold">Description:</label>
                                <textarea
                                    name="description"
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter video description (optional)"
                                    className={`${styles.input}`}
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
                                    className={`${styles.input}`}
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
                                    className={`${styles.input}`}
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
                                    className={`${styles.input}`}
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
                                    className={`${styles.input}`}
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
                                    <div className="text-red text-sm mt-1">{formik.errors.status}</div>
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
                                    className={`${styles.input}`}
                                    min="1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Display Error or Success Messages */}
                    {errorMessage && (
                        <div className="mb-4 text-red">
                            {errorMessage}
                        </div>
                    )}
                    {successMessage && (
                        <div className="mb-4 text-green">
                            {successMessage}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`${styles.button} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
