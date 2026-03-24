const { buildPrompt, callClaude } = require('../services/claudeService');

let db = null;
try { db = require('../db/db'); } catch (_) {}

function detectarNivelRiesgo(texto) {
  const t = texto.toLowerCase();
  const criticos = (t.match(/colapso|crítico|insostenible|severo/g) || []).length;
  const alertas  = (t.match(/moderado|presión|déficit|alerta/g)     || []).length;
  if (criticos >= 2) return 'critico';
  if (criticos >= 1) return 'alto';
  if (alertas  >= 2) return 'moderado';
  return 'bajo';
}

async function analyze(req, res) {
  const { input, output, pregunta } = req.body;

  if (!input || !input.tipo) {
    return res.status(400).json({ error: 'Falta el campo input.tipo en el payload.' });
  }

  try {
    const prompt      = buildPrompt(input, output, pregunta);
    const { text, tokensUsados } = await callClaude(prompt);
    const nivelRiesgo = detectarNivelRiesgo(text);

    // Guardar en SQLite si está disponible
    if (db) {
      try {
        const simId = await db.guardarSimulacion({ tipo: input.tipo, parametros: input });
        await db.guardarResultado({ simulacionId: simId, prompt, respuesta: text, nivelRiesgo, tokensUsados });
      } catch (dbErr) {
        console.warn('[db] No se pudo guardar:', dbErr.message);
      }
    }

    return res.json({ analisis: text, nivelRiesgo });

  } catch (err) {
    console.error('[analyze]', err.message);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { analyze };