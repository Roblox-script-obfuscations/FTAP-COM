export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q = '', page = '1', max = '20' } = req.query;

  const url = `https://scriptblox.com/api/script/search?q=${encodeURIComponent(q)}&max=${encodeURIComponent(max)}&page=${encodeURIComponent(page)}`;

  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://scriptblox.com/',
      },
    });

    if (!r.ok) {
      return res.status(r.status).json({ error: 'upstream error', status: r.status });
    }

    const data = await r.json();
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'proxy error', detail: e.message });
  }
}
