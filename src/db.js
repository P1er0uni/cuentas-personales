import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'

const dataDir = path.resolve(process.env.DATA_DIR ?? 'data')
fs.mkdirSync(dataDir, { recursive: true })

export const db = new Database(path.join(dataDir, 'cuentas.db'))
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS movimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
    monto REAL NOT NULL CHECK (monto > 0),
    categoria TEXT NOT NULL,
    fecha TEXT NOT NULL,
    descripcion TEXT
  );
`)
