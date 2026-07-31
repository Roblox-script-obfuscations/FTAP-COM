/* Vercel Edge Runtime — different IP/TLS stack bypasses ScriptBlox's CF bot block */
export const config = { runtime: 'edge' };

function hasCJK(str) {
  return /[\u3000-\u9fff\uac00-\ud7af\uf900-\ufaff]/.test(str);
}

async function translateToEnglish(query) {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=ja|en`;
    const r   = await fetch(url, { headers: { 'User-Agent': 'FTAP-COM/1.0' } });
    const j   = await r.json();
    const t   = j?.responseData?.translatedText;
    if (t && t.toLowerCase() !== query.toLowerCase()) return t;
  } catch (_) {}
  return null;
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
      },
    });
  }

  let q    = searchParams.get('q')    ?? '';
  const page = searchParams.get('page') ?? '1';
  const max  = searchParams.get('max')  ?? '20';

  /* Auto-translate CJK queries */
  if (hasCJK(q)) {
    const eng = await translateToEnglish(q);
    if (eng) q = eng;
  }

  const upstream = `https://scriptblox.com/api/script/search?q=${encodeURIComponent(q)}&max=${encodeURIComponent(max)}&page=${encodeURIComponent(page)}`;

  try {
    const r = await fetch(upstream, {
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept':          'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin':          'https://scriptblox.com',
        'Referer':         'https://scriptblox.com/',
        'sec-fetch-dest':  'empty',
        'sec-fetch-mode':  'cors',
        'sec-fetch-site':  'same-origin',
      },
    });

    if (!r.ok) {
      const body = await r.text();
      return new Response(JSON.stringify({ error: 'upstream error', status: r.status, body: body.slice(0, 200) }), {
        status: r.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const data = await r.json();
    if (data.result) data.result._translatedQuery = q;

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'proxy error', detail: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
