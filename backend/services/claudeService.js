require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

function buildPrompt(input, output, pregunta) {
  const inputStr  = JSON.stringify(input,  null, 2);
  const outputStr = JSON.stringify(output, null, 2);

  return `Eres JVision AI, un sistema experto en análisis demográfico y simulación poblacional.
Tu objetivo es interpretar escenarios hipotéticos usando datos estructurados.

REGLAS:
- Prioriza los datos numéricos sobre suposiciones.
- Usa lógica causal: si X entonces Y.
- Evita respuestas genéricas.
- Explica consecuencias en cadena (efecto dominó).
- Responde en español.
- Usa formato Markdown: ## secciones, **negrita**, - listas.

─── PARÁMETROS DE ENTRADA ───
${inputStr}

─── RESULTADOS DE LA SIMULACIÓN ───
${outputStr}

─── PREGUNTA ───
${pregunta}

─── TU ANÁLISIS ───
Genera un análisis con:
## 1. Interpretación del escenario
## 2. Cambios en variables clave
## 3. Evolución temporal
## 4. Riesgos estructurales
## 5. Conclusión`;
}

async function callClaude(prompt) {
  const response = await client.chat.completions.create({
    model:      'llama-3.3-70b-versatile',
    max_tokens: 1024,
    messages:   [{ role: 'user', content: prompt }]
  });

  return {
    text:         response.choices[0]?.message?.content ?? 'Sin respuesta.',
    tokensUsados: response.usage?.total_tokens || 0
  };
}

module.exports = { buildPrompt, callClaude };