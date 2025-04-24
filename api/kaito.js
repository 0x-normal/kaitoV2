// api/kaito.js
const axios = require('axios');

module.exports = async (req, res) => {
    const { username } = req.query;
    const apiUrl = `https://api.kaito.ai/api/v1/yaps?username=${username}`;

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'Accept': 'application/json'
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching data from Kaito API:', error);
        res.status(500).json({ error: 'Failed to fetch data from Kaito API' });
    }
};
