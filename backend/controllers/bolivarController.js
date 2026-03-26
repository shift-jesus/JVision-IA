require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const Groq   = require('groq-sdk');
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

/* ─── Fetch con reintentos y timeout extendido ─── */
async function fetchDataset(endpoint) {
    const url = `${endpoint}?$top=30`;

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const res = await fetch(url, {
                headers: { 'Accept': 'application/json', 'User-Agent': 'JVisionAI/1.1' },
                signal: AbortSignal.timeout(15000)
            });

            if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);

            const text = await res.text();

            // Algunos endpoints retornan HTML de error aunque status sea 200
            if (text.trim().startsWith('<')) {
                throw new Error('El endpoint retornó HTML en lugar de JSON. Dataset puede estar restringido.');
            }

            const json = JSON.parse(text);

            // OData v4 devuelve { value: [...] }, algunos devuelven array directo
            const rows = Array.isArray(json) ? json
                : Array.isArray(json.value) ? json.value
                    : json.d?.results || [];  // compatibilidad OData v2

            if (rows.length === 0) {
                throw new Error('El dataset no retornó registros. Puede estar vacío o restringido.');
            }

            return rows;

        } catch (err) {
            console.warn(`[bolivar] Intento ${attempt}/3 fallido para ${endpoint}: ${err.message}`);
            if (attempt === 3) throw err;
            await new Promise(r => setTimeout(r, 1000 * attempt));
        }
    }
}

/* ─── Truncar datos para no exceder tokens de Groq ─── */
function truncarDatos(data) {
    // Tomamos máximo 20 registros y limitamos caracteres del JSON
    const sample    = data.slice(0, 20);
    const json      = JSON.stringify(sample, null, 2);
    const MAX_CHARS = 6000;
    return json.length > MAX_CHARS ? json.slice(0, MAX_CHARS) + '\n... [datos truncados por longitud]' : json;
}

/* ─── Controller principal ─── */
async function analyzeBolivar(req, res) {
    const { endpoint, dataset, question } = req.body;

    if (!endpoint || !question) {
        return res.status(400).json({ error: 'Faltan campos requeridos: endpoint y question.' });
    }

    // 1. Obtener datos reales
    let data;
    try {
        data = await fetchDataset(endpoint);
    } catch (fetchErr) {
        console.error('[bolivar] Error al obtener datos:', fetchErr.message);

        // Responder con IA aunque no haya datos, explicando la situación
        const fallbackPrompt = `Eres JVision AI, experto en salud pública de Colombia.
El usuario preguntó sobre el dataset "${dataset}" pero no se pudieron obtener los datos en tiempo real.
Error técnico: ${fetchErr.message}

Pregunta del usuario: ${question}

Responde lo que puedas con tu conocimiento general sobre este tema de salud en Bolívar, Colombia.
Aclara al inicio que los datos en tiempo real no estuvieron disponibles y que tu respuesta es basada en contexto general.
Sé útil, concreto y breve (máximo 200 palabras). Responde en español.`;

        try {
            const fallback = await client.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                max_tokens: 400,
                messages: [{ role: 'user', content: fallbackPrompt }]
            });
            return res.json({
                respuesta: fallback.choices[0]?.message?.content ?? 'Sin respuesta.',
                advertencia: 'Datos en tiempo real no disponibles. Respuesta basada en contexto general.',
                registros: 0
            });
        } catch (aiErr) {
            return res.status(500).json({ error: `Error de datos: ${fetchErr.message} | Error de IA: ${aiErr.message}` });
        }
    }

    // 2. Construir prompt con datos reales truncados
    const sample = truncarDatos(data);
    const prompt = `Eres JVision AI, experto en salud pública y análisis de datos de Colombia.
Tienes acceso a datos reales del portal datos.gov.co del Departamento de Bolívar.

DATASET: ${dataset}
TOTAL DE REGISTROS OBTENIDOS: ${data.length}

DATOS REALES:
${sample}

PREGUNTA DEL USUARIO:
${question}

INSTRUCCIONES:
- Responde SOLO basándote en los datos proporcionados.
- Si los datos no contienen suficiente información, dilo claramente.
- Cita cifras, años, municipios o categorías específicas de los datos.
- Usa negritas para cifras clave.
- Máximo 300 palabras. Responde en español.`;

    // 3. Llamar a Groq
    try {
        const response = await client.chat.completions.create({
            model:      'llama-3.3-70b-versatile',
            max_tokens: 600,
            messages:   [{ role: 'user', content: prompt }]
        });

        return res.json({
            respuesta:  response.choices[0]?.message?.content ?? 'Sin respuesta.',
            registros:  data.length
        });

    } catch (aiErr) {
        console.error('[bolivar] Error Groq:', aiErr.message);
        return res.status(500).json({ error: `Error al procesar con IA: ${aiErr.message}` });
    }
}

module.exports = { analyzeBolivar };