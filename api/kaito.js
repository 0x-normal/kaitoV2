const axios = require('axios');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username } = req.query;
    
    // Validate username parameter
    if (!username || username.trim() === '') {
        return res.status(400).json({ 
            error: 'Username parameter is required',
            details: 'Please provide a valid username in the query parameters'
        });
    }

    const apiUrl = `https://api.kaito.ai/api/v1/yaps?username=${encodeURIComponent(username.trim())}`;

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Kaito-Research-App/1.0'
            },
            timeout: 10000 // 10 seconds timeout
        });

        // Ensure the response is valid JSON
        if (typeof response.data !== 'object') {
            throw new Error('Invalid response format from Kaito API');
        }

        return res.status(200).json(response.data);
    } catch (error) {
        // Prepare error response
        let errorResponse = {
            error: 'Failed to fetch data from Kaito API',
            details: null
        };

        if (error.response) {
            // Server responded with error status
            errorResponse.error = `Kaito API Error: ${error.response.status}`;
            errorResponse.details = error.response.data || 'No additional details';
        } else if (error.request) {
            // No response received
            errorResponse.error = 'Network Error';
            errorResponse.details = 'No response received from Kaito API';
        } else {
            // Request setup error
            errorResponse.error = 'Request Error';
            errorResponse.details = error.message;
        }

        return res.status(error.response?.status || 500).json(errorResponse);
    }
};
