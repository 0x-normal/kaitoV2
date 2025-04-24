const axios = require('axios');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { username } = req.query;
    if (!username?.trim()) {
        return res.status(400).json({ 
            error: 'Validation Error',
            details: 'Username is required'
        });
    }

    const apiUrl = `https://api.kaito.ai/api/v1/yaps?username=${encodeURIComponent(username.trim())}`;

    try {
        const response = await axios.get(apiUrl, {
            headers: { 'Accept': 'application/json' },
            timeout: 10000,
            transformResponse: [data => data] // Get raw response
        });

        // Validate JSON
        let parsedData;
        try {
            parsedData = JSON.parse(response.data);
        } catch (e) {
            console.error('Invalid JSON from API:', response.data);
            throw new Error('API returned invalid JSON');
        }

        return res.status(200).json({
            success: true,
            data: parsedData
        });
        
    } catch (error) {
        console.error('API Error:', error);
        
        return res.status(500).json({
            success: false,
            error: 'API Error',
            details: error.response?.data || error.message
        });
    }
};
