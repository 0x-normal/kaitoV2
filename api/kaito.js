const axios = require('axios');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
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
    if (!username) {
        return res.status(400).json({ error: 'Username parameter is required' });
    }

    const apiUrl = `https://api.kaito.ai/api/v1/yaps?username=${encodeURIComponent(username)}`;
    console.log('Making request to Kaito API with URL:', apiUrl);

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Kaito-Research-App/1.0'
            },
            timeout: 10000 // 10 seconds timeout
        });

        console.log('Received response from Kaito API. Status:', response.status);
        
        if (response.status !== 200) {
            console.error('Kaito API returned non-200 status:', response.status, response.data);
            return res.status(502).json({ 
                error: `Kaito API returned status: ${response.status}`,
                details: response.data 
            });
        }

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching data from Kaito API:', error);

        let errorMessage = 'Failed to fetch data from Kaito API';
        let statusCode = 500;
        
        if (error.response) {
            // Server responded with error status
            errorMessage = `Kaito API Error: ${error.response.status}`;
            statusCode = error.response.status === 404 ? 404 : 502;
            if (error.response.data) {
                errorMessage += ` - ${JSON.stringify(error.response.data)}`;
            }
        } else if (error.request) {
            // No response received
            errorMessage = 'No response received from Kaito API (timeout or network error)';
            statusCode = 504;
        } else {
            // Request setup error
            errorMessage = error.message;
        }

        return res.status(statusCode).json({ 
            error: errorMessage,
            details: error.config ? { url: error.config.url } : null
        });
    }
};
