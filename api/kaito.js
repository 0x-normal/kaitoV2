const axios = require('axios');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // Validate request method
        if (req.method !== 'GET') {
            return res.status(405).json({
                status: 'error',
                code: 'METHOD_NOT_ALLOWED',
                message: 'Only GET requests are allowed'
            });
        }

        // Validate and sanitize input
        const username = req.query.username?.trim();
        if (!username) {
            return res.status(400).json({
                status: 'error',
                code: 'INVALID_INPUT',
                message: 'Username parameter is required'
            });
        }

        // Configure API request
        const apiUrl = `https://api.kaito.ai/api/v1/yaps?username=${encodeURIComponent(username)}`;
        console.log(`Request to Kaito API: ${apiUrl}`);

        const response = await axios.get(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'KaitoResearch/1.0'
            },
            timeout: 8000,
            validateStatus: () => true // Handle all status codes
        });

        // Validate response format
        if (!response.headers['content-type']?.includes('application/json')) {
            console.error('Invalid content type:', response.headers['content-type']);
            return res.status(502).json({
                status: 'error',
                code: 'INVALID_CONTENT_TYPE',
                message: 'Unexpected response format from upstream API',
                receivedType: response.headers['content-type'],
                sampleData: response.data?.toString().substring(0, 200)
            });
        }

        // Process successful response
        return res.status(200).json({
            status: 'success',
            data: response.data
        });

    } catch (error) {
        console.error('Server error:', error);
        
        // Special handling for common error types
        let statusCode = 500;
        let errorCode = 'SERVER_ERROR';
        let message = 'Internal server error';
        
        if (error.code === 'ECONNABORTED') {
            statusCode = 504;
            errorCode = 'TIMEOUT';
            message = 'Request timed out';
        } else if (error.response) {
            statusCode = 502;
            errorCode = 'UPSTREAM_ERROR';
            message = `API error: ${error.response.status}`;
        } else if (error.request) {
            statusCode = 503;
            errorCode = 'NETWORK_ERROR';
            message = 'Network connection failed';
        }

        return res.status(statusCode).json({
            status: 'error',
            code: errorCode,
            message: message,
            debug: process.env.NODE_ENV === 'development' ? {
                errorMessage: error.message,
                stack: error.stack
            } : undefined
        });
    }
};
