/* Detect CJK (Japanese / Chinese / Korean) characters */
function hasCJK(str) {
  return /[\u3000-\u9fff\uac00-\ud7af\uf900-\ufaff]/.test(str);
}

/* Translate query via MyMemory (free, no key needed) */
async function translateToEnglish(query) {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=ja|en`;
    const r   = await fetch(url, { headers: { 'User-Agent': 'FTAP-COM/1.0' } });
    const j   = await r.json();
    const translated = j?.responseData?.translatedText;
    if (translated && translated.toLowerCase() !== query.toLowerCase()) {
      return translated;
    }
  } catch (_) {}
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  let { q = '', page = '1', max = '20' } = req.query;

  /* Auto-translate CJK queries so ScriptBlox can find games by English name */
  if (hasCJK(q)) {
    const eng = await translateToEnglish(q);
    if (eng) q = eng;
  }

  const url = `https://scriptblox.com/api/script/search?q=${encodeURIComponent(q)}&max=${encodeURIComponent(max)}&page=${encodeURIComponent(page)}`;

  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept':     'application/json',
        'Referer':    'https://scriptblox.com/',
      },
    });

    if (!r.ok) {
      return res.status(r.status).json({ error: 'upstream error', status: r.status });
    }

    const data = await r.json();
    /* Inject translated query so client can show it */
    if (data.result) data.result._translatedQuery = q;
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'proxy error', detail: e.message });
  }
}
