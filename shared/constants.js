/* shared/constants.js
   Constantes compartidas entre frontend y backend.
   En el frontend: importar vía <script> o bundler.
   En el backend:  const { SCENARIOS } = require('../shared/constants');
*/

const SCENARIOS = {
  declive:     { label: 'Declive poblacional',      color: '#4af4a8' },
  migracion:   { label: 'Migración masiva',          color: '#a78bfa' },
  economico:   { label: 'Colapso económico',         color: '#f97316' },
  crecimiento: { label: 'Crecimiento acelerado',     color: '#f4d44a' }
};

const YEAR_RANGE = { start: 2025, end: 2075 };

const RISK_THRESHOLDS = {
  critico:  75,
  alto:     45,
  moderado: 20
};

module.exports = { SCENARIOS, YEAR_RANGE, RISK_THRESHOLDS };
