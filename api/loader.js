export default async function handler(req, res) {
  const accept = req.headers['accept'] || '';
  if (accept.includes('text/html')) {
    res.setHeader('Location', '/');
    return res.status(302).end();
  }

  try {
    const r = await fetch('https://pastefy.app/Brv49k3M/raw');
    const text = await r.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(text);
  } catch (e) {
    res.status(500).send('error');
  }
}
