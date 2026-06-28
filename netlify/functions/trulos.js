// Netlify proxy for Trulos public rate data
exports.handler = async (event) => {
  try {
    const file = (event.queryStringParameters || {}).file || 'state_rates_trends.json';
    const allowed = ['state_rates_trends.json', 'manifest.json'];
    if (!allowed.includes(file)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid file' }) };
    }
    const url = `https://trulos.com/daily/rates-v2/${file}`;
    const res = await fetch(url);
    const data = await res.text();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      },
      body: data
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};