import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Basic Auth headers
const authType = process.env.REACT_APP_AUTH_TYPE || 'basic';
const user = process.env.REACT_APP_BASIC_USER || 'admin';
const pass = process.env.REACT_APP_BASIC_PASS || 'password';

if (!user || !pass) {
    console.error('Authentication credentials are not set properly');
}

console.log('Auth configuration:', {
    authType,
    user,
    API_URL,
    envVars: process.env
});

const headers = authType === 'basic' && user && pass
    ? { Authorization: `Basic ${btoa(`${user}:${pass}`)}` }
    : {};

// Log the actual headers being used
console.log('Using headers:', headers);

export async function createFragment(content, type = 'text/plain') {
    try {
        console.log('Making request with headers:', headers);
        const res = await axios.post(`${API_URL}/v1/fragments`, content, {
            headers: { ...headers, 'Content-Type': type },
        });
        console.log('Response data:', res.data);
        return res.data;
    } catch (error) {
        console.error('Request error:', {
            config: error.config,
            response: error.response?.data
        });
        throw error;
    }
}

export async function listFragments(expand = false) {
    try {
        const res = await axios.get(`${API_URL}/v1/fragments${expand ? '?expand=1' : ''}`, { headers });
        return Array.isArray(res.data.fragments) ? res.data.fragments : [];
    } catch (err) {
        console.error('Error listing fragments:', err);
        return [];
    }
}

export async function getFragmentInfo(id) {
    const res = await axios.get(`${API_URL}/v1/fragments/${id}/info`, { headers });
    console.log('Fragment info response:', res);
    return res.data;
}

export async function getFragmentData(id, format) {
    const url = `${API_URL}/v1/fragments/${id}${format ? '.' + format : ''}`;
    console.log('Fetching fragment data from URL:', url);
    const res = await axios.get(url, {
        headers,
        responseType: 'arraybuffer',
    });
    console.log('Fragment data response headers:', res.headers);
    console.log('Fragment data response data:', res.data);
    return {
        data: new TextDecoder().decode(res.data),
        contentType: res.headers['content-type']
    };
}
