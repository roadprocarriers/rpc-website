exports.handler = async (event) => {
  const KEY = process.env.EIA_API_KEY;
    if (!KEY) return { statusCode: 500, body: JSON.stringify({ error: 'EIA key not configured' }) };
      try {
          const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${KEY}&frequency=weekly&data[0]=value&facets[series][]=EMD_EPD2D_PTE_NUS_DPG&sort[0][column]=period&sort[0][direction]=desc&length=2`;
              const res = await fetch(url);
                  const data = await res.json();
                      return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) };
                        } catch (e) {
                            return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
                              }
                              };
