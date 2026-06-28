exports.handler = async (event) => {
    const { olat, olng, dlat, dlng } = event.queryStringParameters || {};
  const KEY = process.env.HERE_API_KEY;
  if (!KEY) return { statusCode: 500, body: JSON.stringify({ error: 'HERE key not configured' }) };
  if (!olat || !olng || !dlat || !dlng) return { statusCode: 400, body: JSON.stringify({ error: 'Missing coordinates' }) };
  try {
    const url = `https://router.hereapi.com/v8/routes?transportMode=truck&origin=${olat},${olng}&destination=${dlat},${dlng}&return=summary&apiKey=${KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) };
} catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
}
};
