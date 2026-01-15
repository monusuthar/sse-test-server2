const express = require("express");
const app = express();

let clients = [];
let lastCommand = "IDLE";

app.use(express.json());

app.get("/events", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });
  res.flushHeaders();

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter(c => c !== res);
  });
});

app.post("/send", (req, res) => {
  const cmd = req.body.cmd;
  lastCommand = cmd;

  clients.forEach(client => {
    client.write(`data: ${JSON.stringify({ cmd })}\n\n`);
  });

  res.json({ status: "sent", cmd });
});

app.get("/", (req, res) => {
  res.send(`
    <h2>SSE Control Panel</h2>
    <button onclick="send('LED_ON')">LED ON</button>
    <button onclick="send('LED_OFF')">LED OFF</button>
    <script>
      function send(cmd) {
        fetch('/send', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({cmd})
        });
      }
    </script>
  `);
});

app.listen(process.env.PORT || 3000);
