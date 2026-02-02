import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ESCPOSPrinter } from '$lib'; // Ensure path is correct

const execAsync = promisify(exec);

async function runMasterTest() {
  const printerPath = '\\\\localhost\\THERMAL';
  const tempFileName = 'master_test.txt';
  const tempPath = path.join(process.cwd(), tempFileName);

  console.log('--- Starting Print Job ---');

  try {
    const printer = new ESCPOSPrinter();

    // 1. Build Buffer
    console.log('Generating buffer...');
    printer
      .reset()
      // .beepOn(3, 3)
      // .align('center')
      .setTextSize(1, 1)
      .bold(true)
      // .line("Gowtham")
      // .bold(false)
      // .line("Full Options Template")
      // .dashedLine()
      // .align('left')
      // .underline(1).line("Underlined Text").underline(0)
      // .reverse(true).line(" REVERSE MODE ON ").reverse(false)
      // .bold(true).line("BOLD TEXT MODE").bold(false)
      // .dashedLine()
      // .line("INVENTORY CHECK")
      .tableRow('Apple', 'Qty: 10', 48)
      .tableRow('Banana', 'Qty: 05', 48)
      .tableRow('Dragonfruit', 'Qty: 25', 48)
      // .dashedLine()
      // .align('center')
      .line('NATIVE BARCODE')
      .barcode('12345678')
      .line('NATIVE QR CODE')
      .feed(4)
      .cut();

    const buffer = printer.getBuffer();
    console.log(`Buffer created (${buffer.length} bytes)`);

    // 2. Write File
    console.log(`Writing temp file to: ${tempPath}`);
    fs.writeFileSync(tempPath, buffer, 'binary');

    // 3. Execute Copy Command
    const command = `copy /b "${tempPath}" "${printerPath}"`;
    console.log(`Executing command: ${command}`);

    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.error('OS Command Stderr:', stderr);
    }
    console.log('OS Command Stdout:', stdout);

    // 4. Cleanup
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
      console.log('Temp file deleted.');
    }

    console.log('--- Print Job Finished Successfully ---');
  } catch (err) {
    console.error('--- CRITICAL PRINT ERROR ---');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);

    // Final attempt to clean up if error happened after file creation
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
}

// runMasterTest();
