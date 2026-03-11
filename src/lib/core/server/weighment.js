import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

// Configure the port (but don't open it yet)
const port = new SerialPort({
  path: 'COM3',
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  autoOpen: false // Don't auto-open
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// State variables
let isReading = false;
let lastWeight = null;

// Function to start reading
export function startReading() {
  if (isReading) {
    console.log('⚠️ Already reading from scale');
    return;
  }

  // Open the port
  port.open((err) => {
    if (err) {
      console.log('❌ Error opening port:', err.message);
      return;
    }

    isReading = true;
    console.log('✅ Scale reading STARTED');
    console.log('Waiting for weight data...\n');
  });
}

// Function to stop reading
export function stopReading() {
  if (!isReading) {
    console.log('⚠️ Scale is not reading');
    return;
  }

  port.close((err) => {
    if (err) {
      console.log('❌ Error closing port:', err.message);
      return;
    }

    isReading = false;
    console.log('🛑 Scale reading STOPPED');
  });
}

// Function to get reading status
export function getReadingStatus() {
  return {
    isReading,
    isOpen: port.isOpen,
    lastWeight
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
    console.log(`⚖️ Weight: ${weight} kg | Raw: ${cleanData}`);
  } else {
    console.log(`📟 Raw data: ${cleanData}`);
  }
});

// Handle errors
port.on('error', (err) => {
  console.log('❌ Port error:', err.message);
  isReading = false;
});