const axios = require('axios');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { username } = req.query;
    
    if (!username?.trim()) {
        return res.status(400).json({ 
            error: 'Validation Error',
            details: 'Username parameter is required and cannot be empty'
        });
    }

    const apiUrl = `https://api.kaito.ai/api/v1/yaps?username=${encodeURIComponent(username.trim())}`;

    try {
        const response = await axios.get(apiUrl, {
            headers: { 'Accept': 'application/json' },
            timeout: 10000
        });

        if (typeof response.data !== 'object') {
            throw new Error('Invalid API response format');
        }

        return res.status(200).json({
            success: true,
            data: response.data
        });
        
    } catch (error) {
        console.error('API Error:', error);
        
        const statusCode = error.response?.status || 500;
        const errorData = {
            success: false,
            error: error.response?.statusText || 'API Request Failed',
            details: error.response?.data || error.message
        };

        return res.status(statusCode).json(errorData);
    }
};
