import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach access token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Response interceptor - handle token refresh
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const { data } = await axios.post('/api/auth/refresh', { refreshToken }, { withCredentials: true });
                localStorage.setItem('accessToken', data.data.accessToken);
                localStorage.setItem('refreshToken', data.data.refreshToken);
                originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
                return API(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    register: (data) => API.post('/auth/register', data),
    login: (data) => API.post('/auth/login', data),
    socialLogin: (data) => API.post('/auth/social-login', data),
    logout: () => API.post('/auth/logout'),
    getMe: () => API.get('/auth/me'),
    forgotPassword: (data) => API.post('/auth/forgot-password', data),
    resetPassword: (token, data) => API.put(`/auth/reset-password/${token}`, data),
    changePassword: (data) => API.put('/auth/change-password', data),
};

// Book APIs
export const bookAPI = {
    getBooks: (params) => API.get('/books', { params }),
    getBook: (identifier) => API.get(`/books/${identifier}`),
    getFeatured: (limit) => API.get('/books/featured', { params: { limit } }),
    getBestSellers: (limit) => API.get('/books/best-sellers', { params: { limit } }),
    getNewArrivals: (limit) => API.get('/books/new-arrivals', { params: { limit } }),
    getTrending: (limit) => API.get('/books/trending', { params: { limit } }),
    autocomplete: (q) => API.get('/books/search/autocomplete', { params: { q } }),
    // Admin
    getAllAdmin: (params) => API.get('/books/admin/all', { params }),
    create: (data) => API.post('/books', data),
    update: (id, data) => API.put(`/books/${id}`, data),
    delete: (id) => API.delete(`/books/${id}`),
};

// Category APIs
export const categoryAPI = {
    getAll: (params) => API.get('/categories', { params }),
    get: (identifier) => API.get(`/categories/${identifier}`),
    create: (data) => API.post('/categories', data),
    update: (id, data) => API.put(`/categories/${id}`, data),
    delete: (id) => API.delete(`/categories/${id}`),
};

// Author APIs
export const authorAPI = {
    getAll: (params) => API.get('/authors', { params }),
    get: (identifier) => API.get(`/authors/${identifier}`),
    create: (data) => API.post('/authors', data),
    update: (id, data) => API.put(`/authors/${id}`, data),
    delete: (id) => API.delete(`/authors/${id}`),
};

// Publisher APIs
export const publisherAPI = {
    getAll: (params) => API.get('/publishers', { params }),
    get: (id) => API.get(`/publishers/${id}`),
    create: (data) => API.post('/publishers', data),
    update: (id, data) => API.put(`/publishers/${id}`, data),
    delete: (id) => API.delete(`/publishers/${id}`),
};

// Cart APIs
export const cartAPI = {
    get: () => API.get('/cart'),
    add: (data) => API.post('/cart', data),
    update: (bookId, data) => API.put(`/cart/${bookId}`, data),
    remove: (bookId) => API.delete(`/cart/${bookId}`),
    clear: () => API.delete('/cart'),
    applyCoupon: (data) => API.post('/cart/coupon', data),
    removeCoupon: () => API.delete('/cart/coupon/remove'),
};

// User APIs
export const userAPI = {
    getProfile: () => API.get('/users/profile'),
    updateProfile: (data) => API.put('/users/profile', data),
    addAddress: (data) => API.post('/users/addresses', data),
    updateAddress: (id, data) => API.put(`/users/addresses/${id}`, data),
    deleteAddress: (id) => API.delete(`/users/addresses/${id}`),
    getWishlist: () => API.get('/users/wishlist'),
    toggleWishlist: (bookId) => API.post(`/users/wishlist/${bookId}`),
    // Admin
    getAll: (params) => API.get('/users', { params }),
    update: (id, data) => API.put(`/users/${id}`, data),
    delete: (id) => API.delete(`/users/${id}`),
};

// Order APIs
export const orderAPI = {
    create: (data) => API.post('/orders', data),
    getAll: (params) => API.get('/orders', { params }),
    get: (id) => API.get(`/orders/${id}`),
    cancel: (id, data) => API.put(`/orders/${id}/cancel`, data),
    // Admin
    getAllAdmin: (params) => API.get('/orders/admin/all', { params }),
    updateStatus: (id, data) => API.put(`/orders/admin/${id}`, data),
};

// Review APIs
export const reviewAPI = {
    getBookReviews: (bookId, params) => API.get(`/reviews/book/${bookId}`, { params }),
    create: (bookId, data) => API.post(`/reviews/book/${bookId}`, data),
    update: (id, data) => API.put(`/reviews/${id}`, data),
    delete: (id) => API.delete(`/reviews/${id}`),
    toggleLike: (id) => API.post(`/reviews/${id}/like`),
    // Admin
    getAllAdmin: (params) => API.get('/reviews/admin/all', { params }),
    moderate: (id, data) => API.put(`/reviews/admin/${id}/moderate`, data),
};

// Coupon APIs
export const couponAPI = {
    getAll: () => API.get('/admin/coupons'),
    create: (data) => API.post('/admin/coupons', data),
    update: (id, data) => API.put(`/admin/coupons/${id}`, data),
    delete: (id) => API.delete(`/admin/coupons/${id}`),
};

// Admin APIs
export const adminAPI = {
    getDashboard: () => API.get('/admin/dashboard'),
    // Coupons
    getCoupons: () => API.get('/admin/coupons'),
    createCoupon: (data) => API.post('/admin/coupons', data),
    updateCoupon: (id, data) => API.put(`/admin/coupons/${id}`, data),
    deleteCoupon: (id) => API.delete(`/admin/coupons/${id}`),
    // Banners
    getBanners: (params) => API.get('/admin/banners', { params }),
    createBanner: (data) => API.post('/admin/banners', data),
    updateBanner: (id, data) => API.put(`/admin/banners/${id}`, data),
    deleteBanner: (id) => API.delete(`/admin/banners/${id}`),
    // Contact
    getContacts: () => API.get('/admin/contact'),
};

// General APIs
export const generalAPI = {
    getBanners: (params) => API.get('/banners', { params }),
    submitContact: (data) => API.post('/contact', data),
    getNotifications: () => API.get('/notifications'),
    markRead: (id) => API.put(`/notifications/${id}/read`),
    markAllRead: () => API.put('/notifications/read-all'),
};

export default API;
