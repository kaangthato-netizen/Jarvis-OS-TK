/* Jarvis OS proxy — keeps API keys off the browser.
   Run:  ANTHROPIC_API_KEY=sk-... node proxy-server.js   (Node 18+, no deps)
   Then set Settings ⚙ → AI Brain → Proxy URL to http://localhost:8787
   (or deploy this file to Replit/Render and use that URL).

   It forwards /v1/messages → Anthropic and /v1/chat/completions → OpenAI,
   injecting the key server-side. Leave the API-key field in Jarvis blank
   (or set any placeholder) when a proxy is configured.

   This is also where real Google OAuth (Gmail/Calendar/Sheets/Slides)
   would live — add token exchange + API routes here. // TODO
*/
const http = require("http");

const ROUTES = {
  "/v1/messages": {
    host: "api.anthropic.com",
    headers: () => ({
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    }),
  },
  "/v1/chat/completions": {
    host: "api.openai.com",
    headers: () => ({ Authorization: "Bearer " + (process.env.OPENAI_API_KEY || "") }),
  },
};

http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access, authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.end();

  const route = ROUTES[req.url];
  if (!route) { res.statusCode = 404; return res.end(JSON.stringify({ error: "unknown route" })); }

  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", async () => {
    try {
      const upstream = await fetch(`https://${route.host}${req.url}`, {
        method: "POST",
        headers: { "content-type": "application/json", ...route.headers() },
        body,
      });
      res.statusCode = upstream.status;
      res.setHeader("content-type", "application/json");
      res.end(await upstream.text());
    } catch (e) {
      res.statusCode = 502;
      res.end(JSON.stringify({ error: e.message }));
    }
  });
}).listen(process.env.PORT || 8787, () => console.log("Jarvis proxy on :" + (process.env.PORT || 8787)));
