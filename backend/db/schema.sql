-- ============================================================
--  JVision AI — Schema SQLite v1.0
--  Las tablas se crean automáticamente desde db.js al arrancar.
--  Este archivo es solo referencia / documentación.
-- ============================================================

CREATE TABLE IF NOT EXISTS usuario (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre     TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS simulacion (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER REFERENCES usuario(id) ON DELETE SET NULL,
  tipo       TEXT NOT NULL,   -- 'declive' | 'migracion' | 'economico' | 'crecimiento'
  parametros TEXT NOT NULL,   -- JSON con los sliders
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS resultado_ia (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  simulacion_id INTEGER NOT NULL REFERENCES simulacion(id) ON DELETE CASCADE,
  prompt        TEXT NOT NULL,
  respuesta     TEXT NOT NULL,
  nivel_riesgo  TEXT,         -- 'critico' | 'alto' | 'moderado' | 'bajo'
  tokens_usados INTEGER,
  created_at    TEXT DEFAULT (datetime('now'))
);

-- Consulta útil: historial completo
-- SELECT s.tipo, s.parametros, r.nivel_riesgo, r.respuesta, s.created_at
-- FROM simulacion s
-- LEFT JOIN resultado_ia r ON r.simulacion_id = s.id
-- ORDER BY s.created_at DESC;
