// backend/plc_modbus.js
import ModbusRTU from "modbus-serial";

const client = new ModbusRTU();
let connected = false;

export async function connectPLC(ip = "192.168.1.50", port = 502, unitId = 1) {
  if (connected) return;
  await client.connectTCP(ip, { port });
  client.setID(unitId);
  client.setTimeout(2000);
  connected = true;
}

export async function sendJob({ job_id, total_ml, ml }) {
  // ml = { orange, ananas, sprite, cola }
  // HR100..: job / total / per pump
  await client.writeRegisters(100, [
    job_id,
    total_ml,
    ml.orange || 0,
    ml.ananas || 0,
    ml.sprite || 0,
    ml.cola || 0
  ]);

  // C0 impulse start
  await client.writeCoil(0, true);
  await new Promise(r => setTimeout(r, 100));
  await client.writeCoil(0, false);

  return true;
}

export async function readStatus() {
  const res = await client.readHoldingRegisters(200, 5);
  const [STATE, PROGRESS, STEP, ERROR_CODE, CURRENT_JOB_ID] = res.data;

  return {
    state: STATE,
    progress: PROGRESS,
    step: STEP,
    error_code: ERROR_CODE,
    current_job_id: CURRENT_JOB_ID
  };
}
