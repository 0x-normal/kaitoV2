const axios = require('axios');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        // Validate input
        const username = req.query.username?.trim();
        if (!username) {
            return res.status(400).json({ error: "Username parameter is required" });
        }

        // Make API request
        const response = await axios.get(`https://api.kaito.ai/api/v1/yaps?username=${encodeURIComponent(username)}`, {
            headers: { 'Accept': 'application/json' },
            timeout: 8000
        });

        // Return successful response
        return res.status(200).json(response.data);

    } catch (error) {
        // Handle different error types
        let status = 500;
        let message = 'Internal server error';
        
        if (error.response) {
            status = error.response.status;
            message = error.response.data || message;
        } else if (error.code === 'ECONNABORTED') {
            status = 504;
            message = 'Request timeout';
        }

        return res.status(status).json({ error: message });
    }
};
