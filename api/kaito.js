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

        if (response.status !== 200) {
            console.error('Kaito API returned non-200 status:', response.status, response.data);
            return res.status(500).json({ error: `Kaito API returned status: ${response.status}` });
        }

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching data from Kaito API:', error);

        let errorMessage = 'Failed to fetch data from Kaito API';
        if (error.response && error.response.data) {
            errorMessage = JSON.stringify(error.response.data); // Stringify the error data
        } else if (error.message) {
            errorMessage = error.message;
        }

        res.status(500).json({ error: errorMessage });
    }
};
