const API_BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? '/api'
    : 'http://localhost:5000');
class ApiClient {
    constructor() {
        this.token = localStorage.getItem('token') || null;
    }
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        }
        else {
            localStorage.removeItem('token');
        }
    }
    getToken() {
        return this.token;
    }
    getUser() {
        const userStr = localStorage.getItem('user');
        try {
            return userStr ? JSON.parse(userStr) : null;
        }
        catch (e) {
            return null;
        }
    }
    setUser(user) {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }
        else {
            localStorage.removeItem('user');
        }
    }
    logout() {
        this.setToken(null);
        this.setUser(null);
    }
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        const config = {
            ...options,
            headers,
        };
        if (config.body && typeof config.body !== 'string') {
            config.body = JSON.stringify(config.body);
        }
        try {
            const response = await fetch(url, config);
            if (response.status === 401 && !endpoint.startsWith('/api/auth/')) {
                this.logout();
                window.location.href = '/login';
                throw new Error('Session expired. Please log in again.');
            }
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }
            return data;
        }
        catch (error) {
            console.error(`API Error on ${endpoint}:`, error.message);
            throw error;
        }
    }
    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }
    post(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    }
    put(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    }
    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
}
export const api = new ApiClient();
