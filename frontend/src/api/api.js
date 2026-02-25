import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
});

// Helper to get full image URL
export const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/400';

    // If the path is an array, take the first element
    const imagePath = Array.isArray(path) ? path[0] : path;

    if (!imagePath) return 'https://via.placeholder.com/400';
    if (imagePath.startsWith('http')) return imagePath;

    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseURL}${cleanPath}`;
};

export default api;
