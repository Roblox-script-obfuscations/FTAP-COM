export default function handler(req, res) {
  const ua = req.headers['user-agent'] || '';
  const isRoblox = ua.toLowerCase().includes('roblox');

  if (!isRoblox) {
    res.setHeader('Location', '/v2/loader');
    return res.status(302).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send('loadstring(game:HttpGet("https://raw.githubusercontent.com/Roblox-script-obfuscations/ftap/refs/heads/main/dontlook.lua"))()');
}
