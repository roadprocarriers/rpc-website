exports.handler = async (event) => {
    const { q } = event.queryStringParameters || {};
  const KEY = process.env.HERE_API_KEY;
  if (!KEY) return { statusCode: 500, body: JSON.stringify({ error: 'HERE key not configured' }) };
  if (!q) return { statusCode: 400, body: JSON.stringify({ items: [] }) };
  try {
    const url = `https://autocomplete.search.hereapi.com/v1/autocomplete?q=${encodeURIComponent(q)}&in=countryCode:USA&resultTypes=city,postalCode&apiKey=${KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) };
} catch (e) {
    return { statusCode: 500, body: JSON.stringify({ items: [] }) };
}
};
