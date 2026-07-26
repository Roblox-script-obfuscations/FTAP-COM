export default function handler(req, res) {
  const accept = req.headers['accept'] || '';
  if (accept.includes('text/html')) {
    res.setHeader('Location', '/');
    return res.status(302).end();
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send('loadstring(game:HttpGet("https://raw.githubusercontent.com/Roblox-script-obfuscations/ftap/refs/heads/main/dontlook.lua"))()');
}
