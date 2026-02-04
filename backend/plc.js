import ModbusRTU from "modbus-serial";
import config from "./config.json" assert { type: "json" };

const client = new ModbusRTU();

let connected = false;

export async function connectPLC() {
  if (connected) return;

  await client.connectTCP(config.plc.ip, {
    port: config.plc.port
  });

  client.setID(config.plc.unitId);
  client.setTimeout(2000);

  connected = true;
  console.log("PLC connected");
}

export async function setOutput(coil, state) {
  if (!connected) await connectPLC();

  // coil = sortie automate (Q0, Q1...)
  await client.writeCoil(coil, state);
}
