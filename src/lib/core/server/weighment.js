import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { handleServiceError, handleSuccess } from './error';
import { sendWeighment } from './weighmentSseBus';

// Configure the port (but don't open it yet)
const port = new SerialPort({
  path: 'COM3',
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  autoOpen: false, // Don't auto-open
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// State variables
let isReading = false;
let lastWeight = null;

export function startReading() {
  if (isReading) {
    return Promise.resolve(handleSuccess('Already Turned on'));
  }

  return new Promise((resolve) => {
    port.open((err) => {
      if (err) {
        console.log('❌ Error opening port:', err.message);
        isReading = false;
        // Resolve with the error handler so the service gets the value
        resolve(handleServiceError('Can not opening weighment com port'));
      } else {
        isReading = true;
        resolve(handleSuccess('Weighment Turned on'));
      }
    });
  });
}

export function stopReading() {
  if (!isReading) {
    return Promise.resolve(handleSuccess('Already Turned off'));
  }

  return new Promise((resolve) => {
    port.close((err) => {
      if (err) {
        console.log('❌ Error closing port:', err.message);
        resolve(handleServiceError('Can not closing weighment com port'));
      } else {
        isReading = false;
        resolve(handleSuccess('Weighment Turned off'));
      }
    });
  });
}

// Function to get reading status
export function getReadingStatus() {
  return {
    isReading,
    isOpen: port.isOpen,
    lastWeight,
  };
}

// Handle incoming data (always listening, but only process when reading)
parser.on('data', (data) => {
  // Only process if we're actively reading
  if (!isReading) return;

  const cleanData = data.toString().trim();
  const weightMatch = cleanData.match(/(\d+\.?\d*)/);

  if (weightMatch) {
    const weight = parseFloat(weightMatch[0]);
    lastWeight = weight; // Store last weight
    sendWeighment(weight);
    // console.log(`⚖️ Weight: ${weight} kg | Raw: ${cleanData}`);
  } else {
    // console.log(`📟 Raw data: ${cleanData}`);
  }
});

// Handle errors
port.on('error', (err) => {
  console.log('❌ Port error:', err.message);
  isReading = false;
});
