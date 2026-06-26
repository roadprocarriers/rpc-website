.handler = async (event) => {
  const { lat, lon } = event.queryStringParameters || {};
  const KEY = process.env.OWM_API_KEY;
  if (!KEY) return { statusCode: 500, body: JSON.stringify({ error: 'OWM key not configured' }) };
  if (!lat || !lon) return { statusCode: 400, body: JSON.stringify({ error: 'Missing coordinates' }) };
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
