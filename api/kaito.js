const axios = require('axios');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { username } = req.query;
    
    // Validate input
    if (!username?.trim()) {
        return res.status(400).json({ 
            status: 'error',
            message: 'Username is required',
            details: null
        });
    }

    const apiUrl = `https://api.kaito.ai/api/v1/yaps?username=${encodeURIComponent(username.trim())}`;

    try {
        // Make API request with timeout
        const response = await axios.get(apiUrl, {
            headers: { 
                'Accept': 'application/json',
                'User-Agent': 'Kaito-Research/1.0'
            },
            timeout: 8000,
            responseType: 'text' // Get raw response first
        });

        // Parse and validate response
        let responseData;
        try {
            responseData = JSON.parse(response.data);
        } catch (e) {
            console.error('Invalid JSON response:', response.data);
            return res.status(502).json({
                status: 'error',
                message: 'Invalid API response format',
                details: response.data.substring(0, 200) // Show partial response for debugging
            });
        }

        return res.status(200).json({
            status: 'success',
            data: responseData
        });

    } catch (error) {
        console.error('API Error:', error);
        
        // Handle different error types
        let errorMessage = 'API request failed';
        let errorDetails = null;
        let statusCode = 500;

        if (error.response) {
            // Server responded with error status
            statusCode = error.response.status;
            errorMessage = `API responded with ${statusCode}`;
            try {
                errorDetails = JSON.parse(error.response.data);
            } catch {
                errorDetails = error.response.data.substring(0, 200);
            }
        } else if (error.request) {
            // No response received
            errorMessage = 'No response from API server';
            errorDetails = 'Request timed out or network error';
            statusCode = 504;
        } else {
            // Request setup error
            errorDetails = error.message;
        }

        return res.status(statusCode).json({
            status: 'error',
            message: errorMessage,
            details: errorDetails
        });
    }
};
