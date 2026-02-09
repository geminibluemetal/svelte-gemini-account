// src\lib\core\server\db.js
import Database from 'better-sqlite3';

const db = new Database('database/app.db', {
  verbose: console.log
});

/**
 * FULL SYNCHRONIZATION SETUP
 */

// 1. Set synchronous to FULL
// This forces the OS to wait for the disk hardware to confirm the write.
db.pragma('synchronous = FULL');

// 2. Set journal_mode to WAL (Write-Ahead Logging)
// WAL is significantly more robust than the default "DELETE" mode.
// It prevents database corruption if the power cuts out mid-write.
db.pragma('journal_mode = WAL');

export default db;
