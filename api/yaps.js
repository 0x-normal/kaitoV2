export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const response = await fetch(`https://api.kaito.ai/api/v1/yaps?username=${username}`);
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
}
