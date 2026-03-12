import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { handleServiceError, handleSuccess } from './error';
import { sendWeighment } from './weighmentSseBus';
import SettingsService from '$lib/features/settings/SettingsService';

const settingsService = new SettingsService();

/* --------------------------------
   GLOBAL STATE (HMR SAFE)
-------------------------------- */

if (!globalThis.weighmentState) {
  globalThis.weighmentState = {
    port: null,
    parser: null,
    isReading: false,
    lastWeight: null
  };
}

const state = globalThis.weighmentState;

/* --------------------------------
   CREATE SERIAL PORT
-------------------------------- */

async function createPort() {

  const settings = await settingsService.getSettings();

  const portSettings = {
    path: settings?.weighment?.path || 'COM3',
    baudRate: settings?.weighment?.baudRate || 9600,
    dataBits: settings?.weighment?.dataBits || 8,
    stopBits: settings?.weighment?.stopBits || 1,
    parity: settings?.weighment?.parity || 'none',
    autoOpen: false
  };

  state.port = new SerialPort(portSettings);

  state.parser = state.port.pipe(
    new ReadlineParser({ delimiter: '\r' })
  );

  bindListeners();

}

/* --------------------------------
   BIND SERIAL LISTENERS
-------------------------------- */

function bindListeners() {

  const { port, parser } = state;

  parser.removeAllListeners('data');

  parser.on('data', (data) => {

    if (!state.isReading) return;

    const cleanData = data.toString().trim();

    const weightMatch = cleanData.match(/^:(-?\d+\.?\d*)/);

    if (weightMatch) {

      const weight = weightMatch[1];

      state.lastWeight = weight;

      sendWeighment(weight);

      // console.log("⚖️ Weight:", weight);

    }

  });

  port.removeAllListeners('error');

  port.on('error', (err) => {

    console.log('❌ Serial Port Error:', err.message);

    state.isReading = false;

  });

}

/* --------------------------------
   START READING
-------------------------------- */

export async function startReading() {

  if (state.isReading) {
    return handleSuccess('Already Turned on');
  }

  try {

    if (!state.port) {
      await createPort();
    }

    if (state.port.isOpen) {
      state.isReading = true;
      return handleSuccess('Weighment Turned on');
    }

    await new Promise((resolve, reject) => {
      state.port.open((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    console.log('✅ Weighment port opened');

    state.isReading = true;

    return handleSuccess('Weighment Turned on');

  } catch (err) {

    console.log('❌ Error opening port:', err.message);

    state.isReading = false;

    return handleServiceError('Cannot open weighment COM port');

  }

}

/* --------------------------------
   STOP READING
-------------------------------- */

export async function stopReading() {

  if (!state.isReading) {
    return handleSuccess('Already Turned off');
  }

  try {

    if (state.port && state.port.isOpen) {

      await new Promise((resolve, reject) => {
        state.port.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      console.log('🛑 Weighment port closed');

    }

    state.isReading = false;

    return handleSuccess('Weighment Turned off');

  } catch (err) {

    console.log('❌ Error closing port:', err.message);

    return handleServiceError('Cannot close weighment COM port');

  }

}

/* --------------------------------
   RELOAD PORT (WHEN SETTINGS CHANGE)
-------------------------------- */

export async function reloadPort() {

  try {

    if (state.port && state.port.isOpen) {

      await new Promise((resolve) => state.port.close(resolve));

    }

    if (state.parser) {
      state.parser.removeAllListeners();
    }

    if (state.port) {
      state.port.removeAllListeners();
    }

    state.port = null;
    state.parser = null;

    await createPort();

    console.log("🔄 Weighment port reloaded with new settings");

    return handleSuccess("Weighment settings updated");

  } catch (err) {

    console.log("❌ Reload error:", err.message);

    return handleServiceError("Failed to reload weighment port");

  }

}

/* --------------------------------
   STATUS
-------------------------------- */

export function getReadingStatus() {

  return {
    isReading: state.isReading,
    isOpen: state.port ? state.port.isOpen : false,
    lastWeight: state.lastWeight
  };

}