// print.js
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ESCPOSPrinter } from './escPos';

const execAsync = promisify(exec);

// Constants
const PRINTER_PATH = '\\\\localhost\\THERMAL';
const TEMP_FILENAME = 'print_job.txt';

/**
 * Universal print function
 * @param {Array|Function} content - Content to print (array or builder function)
 * @returns {Promise<boolean>} - Success status
 */
export async function printOut(content) {
  const tempPath = join(process.cwd(), TEMP_FILENAME);

  try {
    const printer = new ESCPOSPrinter();

    // Build content
    if (Array.isArray(content)) {
      content.forEach(([method, ...args]) => {
        printer[method](...args);
      });
    } else if (typeof content === 'function') {
      content(printer);
    } else {
      throw new Error('Content must be array or function');
    }

    const buffer = printer.getBuffer();

    // Write temp file
    writeFileSync(tempPath, buffer, 'binary');

    // Print
    const command = `copy /b "${tempPath}" "${PRINTER_PATH}"`;
    await execAsync(command);

    // Cleanup
    if (existsSync(tempPath)) {
      unlinkSync(tempPath);
    }

    return true;
  } catch (error) {
    // Cleanup on error
    if (existsSync(tempPath)) {
      unlinkSync(tempPath);
    }
    console.error('Print error:', error);
    return false;
  }
}