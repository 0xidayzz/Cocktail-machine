let ws = null;
const listeners = new Set();

export function plcConnect(wsUrl, onLog) {
  if (ws) return ws;

  onLog?.(`WS connecting: ${wsUrl}`);
  ws = new WebSocket(wsUrl);

  ws.onopen = () => onLog?.("WS open");
  ws.onclose = () => onLog?.("WS close");
  ws.onerror = () => onLog?.("WS error");

  ws.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data);
      for (const fn of listeners) fn(msg);
    } catch {
      onLog?.("WS parse error");
    }
  };

  return ws;
}

export function plcOnMessage(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
