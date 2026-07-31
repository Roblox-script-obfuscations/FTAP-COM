/* Vercel Edge Runtime — different IP/TLS stack bypasses ScriptBlox's CF bot block */
export const config = { runtime: 'edge' };

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

  const slug = searchParams.get('slug');
  const id   = searchParams.get('id');

  if (!slug && !id) {
    return new Response(JSON.stringify({ error: 'slug or id required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const HEADERS = {
    'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Accept':          'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin':          'https://scriptblox.com',
    'Referer':         'https://scriptblox.com/',
    'sec-fetch-dest':  'empty',
    'sec-fetch-mode':  'cors',
    'sec-fetch-site':  'same-origin',
  };

  /* Try slug first, then id */
  const urls = [];
  if (slug) urls.push(`https://scriptblox.com/api/script/fetch?slug=${encodeURIComponent(slug)}`);
  if (id)   urls.push(`https://scriptblox.com/api/script/fetch?id=${encodeURIComponent(id)}`);
  /* Also try direct path format */
  if (slug) urls.push(`https://scriptblox.com/api/script/${encodeURIComponent(slug)}`);

  let lastErr = 'all urls failed';
  for (const url of urls) {
    try {
      const r = await fetch(url, { headers: HEADERS });
      if (!r.ok) { lastErr = `HTTP ${r.status} from ${url}`; continue; }
      const text = await r.text();
      /* Reject HTML error pages */
      if (text.trim().startsWith('<')) { lastErr = 'HTML response'; continue; }
      const data = JSON.parse(text);
      /* Reject ScriptBlox "not found" messages */
      if (data.message && !data.script && !data._id && !data.title) { lastErr = data.message; continue; }
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (e) { lastErr = e.message; }
  }

  return new Response(JSON.stringify({ error: 'not found', detail: lastErr }), {
    status: 404,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
