import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

// Simple function to read from scale
export function readFromScale() {
  // 1. Configure the port
  const port = new SerialPort({
    path: 'COM3',      // Your comm port
    baudRate: 9600,    // Your baud rate
    dataBits: 8,       // Your data bits
    stopBits: 1,       // Your stop bit
    parity: 'none'     // Your parity setting
  });

  // 2. Create parser to read line by line
  const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

  // 3. When port opens successfully
  port.on('open', () => {
    console.log('✅ Scale connected on COM3');
    console.log('Waiting for weight data...\n');
  });

  // 4. WHEN DATA ARRIVES - THIS IS THE IMPORTANT PART
  parser.on('data', (data) => {
    // Clean the data
    const cleanData = data.toString().trim();

    // Extract just the number from the data
    const weightMatch = cleanData.match(/(\d+\.?\d*)/);

    if (weightMatch) {
      const weight = parseFloat(weightMatch[0]);
      console.log(`Weight: ${weight} kg | Raw: ${cleanData}`);
    } else {
      console.log(`Raw data: ${cleanData}`);
    }
  });

  // 5. Handle errors
  port.on('error', (err) => {
    console.log('❌ Error:', err.message);
  });
}

// Run the function
readFromScale();