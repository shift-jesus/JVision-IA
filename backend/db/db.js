// backend/db/db.js — SQLite con sql.js (funciona en Windows sin compilar)
const initSqlJs = require('sql.js');
const path      = require('path');
const fs        = require('fs');

const DB_PATH = path.join(__dirname, '..', 'jvision.db');

let db = null;

async function getDB() {
  if (db) return db;

  const SQL = await initSqlJs();

  // Cargar BD existente o crear nueva
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Crear tablas si no existen
  db.run(`
    CREATE TABLE IF NOT EXISTS usuario (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre     TEXT NOT NULL,
      email      TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS simulacion (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      tipo       TEXT NOT NULL,
      parametros TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS resultado_ia (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      simulacion_id INTEGER NOT NULL,
      prompt        TEXT NOT NULL,
      respuesta     TEXT NOT NULL,
      nivel_riesgo  TEXT,
      tokens_usados INTEGER,
      created_at    TEXT DEFAULT (datetime('now'))
    );
  `);

  persistir();
  console.log('[db] SQLite (sql.js) listo ->', DB_PATH);
  return db;
}

// Guardar en disco después de cada escritura
function persistir() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function guardarSimulacion({ tipo, parametros, usuarioId = null }) {
  const d = await getDB();
  d.run(
      'INSERT INTO simulacion (usuario_id, tipo, parametros) VALUES (?, ?, ?)',
      [usuarioId, tipo, JSON.stringify(parametros)]
  );
  const result = d.exec('SELECT last_insert_rowid() as id');
  const id = result[0].values[0][0];
  persistir();
  return id;
}

async function guardarResultado({ simulacionId, prompt, respuesta, nivelRiesgo, tokensUsados }) {
  const d = await getDB();
  d.run(
      'INSERT INTO resultado_ia (simulacion_id, prompt, respuesta, nivel_riesgo, tokens_usados) VALUES (?, ?, ?, ?, ?)',
      [simulacionId, prompt, respuesta, nivelRiesgo, tokensUsados]
  );
  persistir();
}

async function obtenerHistorial(limit = 20) {
  const d = await getDB();
  const result = d.exec(`
    SELECT s.id, s.tipo, s.parametros, r.nivel_riesgo, r.tokens_usados, s.created_at
    FROM simulacion s
    LEFT JOIN resultado_ia r ON r.simulacion_id = s.id
    ORDER BY s.created_at DESC LIMIT ${limit}
  `);
  if (!result.length) return [];
  const { columns, values } = result[0];
  return values.map(row =>
      Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );
}

async function obtenerSimulacion(id) {
  const d = await getDB();
  const result = d.exec(`
    SELECT s.*, r.respuesta, r.nivel_riesgo, r.tokens_usados
    FROM simulacion s
    LEFT JOIN resultado_ia r ON r.simulacion_id = s.id
    WHERE s.id = ${id}
  `);
  if (!result.length) return null;
  const { columns, values } = result[0];
  return Object.fromEntries(columns.map((col, i) => [col, values[0][i]]));
}

module.exports = { getDB, guardarSimulacion, guardarResultado, obtenerHistorial, obtenerSimulacion };