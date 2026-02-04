// backend/server.js
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

const PLC_MODE = process.env.PLC_MODE || "mock"; // mock | modbus

function logLine(s) {
  const line = `[${new Date().toISOString()}] ${s}`;
  console.log(line);
  fs.appendFileSync("./backend.log", line + "\n");
}

// ----- PLC driver -----
let plc = null;

if (PLC_MODE === "modbus") {
  plc = await import("./plc_modbus.js");
  const ip = process.env.PLC_IP || "192.168.1.50";
  await plc.connectPLC(ip, 502, 1);
  logLine(`PLC_MODE=modbus ip=${ip}`);
} else {
  plc = await import("./plc_mock.js");
  logLine("PLC_MODE=mock");
}

// ----- HTTP routes -----
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, mode: PLC_MODE, time: new Date().toISOString() });
});

app.get("/api/logs", (req, res) => {
  try {
    const raw = fs.existsSync("./backend.log") ? fs.readFileSync("./backend.log", "utf8") : "";
    const lines = raw.split("\n").filter(Boolean).slice(-200);
    res.json({ lines });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/job", async (req, res) => {
  try {
    const { job_id, total_ml, ml } = req.body;

    if (!job_id || !total_ml || !ml) {
      return res.status(400).json({ error: "Missing job_id/total_ml/ml" });
    }

    logLine(`JOB received id=${job_id} total_ml=${total_ml} ml=${JSON.stringify(ml)}`);
    await plc.sendJob({ job_id, total_ml, ml });

    broadcast({ type: "job_started", job_id });
    res.json({ ok: true });
  } catch (e) {
    logLine(`JOB error ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

// ----- Server + WebSocket -----
const server = app.listen(3001, () => logLine("Backend listening on http://localhost:3001"));

const wss = new WebSocketServer({ noServer: true });
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  logLine("WS client connected");
  ws.send(JSON.stringify({ type: "hello", ok: true }));

  ws.on("close", () => {
    clients.delete(ws);
    logLine("WS client disconnected");
  });
});

function broadcast(obj) {
  const msg = JSON.stringify(obj);
  for (const ws of clients) {
    if (ws.readyState === 1) ws.send(msg);
  }
}

server.on("upgrade", (req, socket, head) => {
  if (req.url === "/ws") {
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
  } else {
    socket.destroy();
  }
});

// ----- Poll PLC status and broadcast -----
let lastKey = "";
setInterval(async () => {
  try {
    const s = await plc.readStatus(); // {state,progress,step,error_code,current_job_id}
    const key = `${s.state}-${s.progress}-${s.current_job_id}-${s.error_code || 0}`;
    if (key !== lastKey) {
      lastKey = key;
      broadcast({ type: "plc_status", ...s });
      logLine(`STATUS state=${s.state} progress=${s.progress} job=${s.current_job_id}`);
    }
  } catch (e) {
    broadcast({ type: "plc_status", state: 3, progress: 0, step: 0, error_code: 999, current_job_id: 0 });
    logLine(`STATUS read error ${e.message}`);
  }
}, 250);
