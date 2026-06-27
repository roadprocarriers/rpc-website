// Netlify serverless function — proxies HERE autocomplete + geocode
exports.handler = async (event) => {
  const { q } = event.queryStringParameters || {};
  const KEY = process.env.HERE_API_KEY;

  if (!KEY) return { statusCode: 500, body: JSON.stringify({ items: [] }) };
  if (!q) return { statusCode: 400, body: JSON.stringify({ items: [] }) };

  const isZip = /^\d{3,5}(\s*USA)?$/.test(q.trim());

  try {
    let data;

    if (isZip) {
      // Use geocode endpoint for ZIPs — returns exact city/state for the ZIP
      const zip = q.replace(/\s*USA\s*/i, '').trim();
      const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(zip)}&in=countryCode:USA&lang=en-US&limit=6&apiKey=${KEY}`;
      const res = await fetch(url);
      const raw = await res.json();
      // Convert geocode format to autocomplete format
      const items = (raw.items || [])
        .filter(i => i.address && i.position)
        .map(i => ({
          address: {
            postalCode: i.address.postalCode || zip,
            city: i.address.city || i.address.county || '',
            stateCode: i.address.stateCode || ''
          },
          position: i.position
        }));
      data = { items };
    } else {
      // Use autocomplete for city names
      const url = `https://autocomplete.search.hereapi.com/v1/autocomplete?q=${encodeURIComponent(q)}&in=countryCode:USA&resultTypes=city,postalCode&limit=8&lang=en-US&apiKey=${KEY}`;
      const res = await fetch(url);
      data = await res.json();
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ items: [] }) };
  }
};
