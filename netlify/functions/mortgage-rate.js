exports.handler = async () => {
  try {
    const apiKey = process.env.FRED_API_KEY;
    if (!apiKey) throw new Error('No API key');

    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=MORTGAGE30US&api_key=${apiKey}&file_type=json&sort_order=desc&limit=5`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('FRED API failed');

    const data = await response.json();
    if (!data.observations || data.observations.length === 0) throw new Error('No data');

    const valid = data.observations.filter(o => o.value !== '.' && !isNaN(parseFloat(o.value)));
    if (valid.length === 0) throw new Error('No valid rate');

    const latest = valid[0];
    const rate = parseFloat(latest.value);
    const date = latest.date;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400'
      },
      body: JSON.stringify({ rate, date })
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ rate: 6.8, date: null, fallback: true })
    };
  }
};
