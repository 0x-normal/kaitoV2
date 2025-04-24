const axios = require('axios');

module.exports = async (req, res) => {
    // CORS Configuration
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');

    // Handle preflight requests
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // Validate request method
        if (req.method !== 'GET') {
            return res.status(405).json({
                status: 'error',
                code: 'METHOD_NOT_ALLOWED',
                message: 'Only GET requests are supported'
            });
        }

        // Validate username parameter
        const username = req.query.username?.trim();
        if (!username) {
            return res.status(400).json({
                status: 'error',
                code: 'MISSING_PARAMETER',
                message: 'Username parameter is required'
            });
        }

        // Configure API request
        const apiUrl = `https://api.kaito.ai/api/v1/yaps?username=${encodeURIComponent(username)}`;
        console.log(`Initiating request to: ${apiUrl}`);

        const response = await axios.get(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'KaitoResearchBot/1.0 (+https://yourdomain.com)',
                'X-Request-ID': generateRequestId()
            },
            timeout: 10000,
            validateStatus: () => true // Capture all status codes
        });

        console.log(`API response status: ${response.status}`);

        // Handle non-JSON responses
        let responseData;
        try {
            responseData = typeof response.data === 'string' 
                ? JSON.parse(response.data)
                : response.data;
        } catch (e) {
            console.error('Invalid JSON response:', response.data);
            return res.status(502).json({
                status: 'error',
                code: 'INVALID_RESPONSE',
                message: 'Received invalid response from upstream API',
                debug: {
                    rawResponse: response.data?.toString().substring(0, 200)
                }
            });
        }

        // Handle API error responses
        if (response.status >= 400) {
            return res.status(502).json({
                status: 'error',
                code: 'UPSTREAM_ERROR',
                message: 'API request failed',
                debug: {
                    statusCode: response.status,
                    errorData: responseData,
                    requestId: response.config.headers['X-Request-ID']
                }
            });
        }

        // Successful response
        return res.status(200).json({
            status: 'success',
            data: responseData
        });

    } catch (error) {
        console.error('Server error:', error);
        
        // Special handling for timeout errors
        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({
                status: 'error',
                code: 'TIMEOUT',
                message: 'Request timed out'
            });
        }

        // Generic error response
        return res.status(500).json({
            status: 'error',
            code: 'SERVER_ERROR',
            message: 'Internal server error',
            debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

function generateRequestId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
