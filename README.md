# JVision AI

> Plataforma de simulación demográfica e inteligencia artificial sobre datos reales de salud en Bolívar, Colombia.

![Version](https://img.shields.io/badge/version-1.2-4af4a8?style=flat-square)
![Node](https://img.shields.io/badge/node-18+-green?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

---

## ¿Qué es JVision AI?

JVision AI tiene dos módulos principales:

**1. Simulador demográfico** — Ajustas parámetros con sliders, el sistema proyecta consecuencias poblacionales hasta 2075 y una IA genera un análisis estructurado con efecto dominó.

**2. Chat con datos reales de Bolívar** — Seleccionas un dataset oficial de datos.gov.co y haces preguntas abiertas en lenguaje natural. La IA consulta los datos reales en tiempo real y responde con cifras específicas.

---

## Módulos

### Simulador demográfico (4 escenarios)

| # | Escenario | Variables |
|---|-----------|-----------|
| 01 | Declive poblacional / envejecimiento | Fecundidad, mortalidad, gasto social |
| 02 | Migración masiva | Emigración, inmigración, remesas |
| 03 | Colapso económico | PIB, desempleo, inflación, salud |
| 04 | Crecimiento acelerado | Fecundidad, urbanización, alimentación |

### Datos reales Bolívar (5 datasets oficiales)

| # | Dataset | Fuente OData |
|---|---------|-------------|
| 01 | Prevalencia Diabetes Mellitus (18–69 años) | vkkq-3tid |
| 02 | Defunciones Municipio de Cartagena | sx38-ug7m |
| 03 | Pensionados Distrito de Cartagena | 2xk8-g74q |
| 04 | Tasa de Mortalidad Neonatal | bmdx-e4fy |
| 05 | Mortalidad por Desnutrición menores de 5 años | uuwf-4izr |

---

## Stack

**Frontend**
- HTML5 / CSS3 / Vanilla JS — sin frameworks
- Chart.js 4.4 — gráficos de proyección
- Google Fonts: DM Serif Display, DM Mono, Syne

**Backend**
- Node.js + Express
- Groq SDK — IA gratuita (Llama 3.3 70B)
- sql.js — SQLite sin compilación nativa (compatible Windows)
- dotenv, cors, nodemon

**Datos**
- Portal datos.gov.co — API OData v4
- Fetch en tiempo real con reintentos automáticos
- Fallback con contexto general si el endpoint no responde

---

## Estructura del proyecto

```
JVision.Offi/
├── backend/
│   ├── api/
│   │   ├── analyze/
│   │   │   └── analyze.js           # POST /api/analyze — simulador
│   │   └── bolivar/
│   │       └── bolivar.js           # POST /api/bolivar — chat datos reales
│   ├── controllers/
│   │   ├── analyzeController.js     # Lógica simulador + nivel de riesgo
│   │   └── bolivarController.js     # Fetch OData + prompt + fallback
│   ├── services/
│   │   └── claudeService.js         # Prompt builder + llamada a Groq
│   ├── db/
│   │   ├── db.js                    # SQLite: tablas, queries, persistencia
│   │   └── schema.sql               # Referencia del schema
│   ├── server.js                    # Entry point Express
│   ├── package.json
│   ├── .env.example
│   └── jvision.db                   # BD SQLite (se crea automáticamente)
├── frontend/
│   └── index.html                   # App completa — simulador + chat Bolívar
├── shared/
│   └── constants.js
├── .gitignore
└── README.md
```

---

## Instalación

### 1. Clona el repositorio

```bash
git clone https://github.com/TU_USUARIO/jvision-ai.git
cd jvision-ai
```

### 2. Configura el backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita `.env`:

```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
PORT=3000
```

Obtén tu key gratis (sin tarjeta) en: https://console.groq.com/keys

### 3. Arranca el servidor

```bash
npm run dev
```

```
JVision AI backend corriendo en http://localhost:3000
```

### 4. Abre el frontend

Abre `frontend/index.html` directamente en el navegador o con un servidor estático:

```bash
npx serve frontend
```

---

## API

### `POST /api/analyze` — Simulador demográfico

```json
{
  "input":    { "tipo": "declive", "fecundidad": 1.3, "poblacion": 50 },
  "output":   { "metricas": {}, "riesgos": {}, "timeline": [] },
  "pregunta": "¿Qué pasaría en este escenario?"
}
```

**Respuesta:**
```json
{ "analisis": "## 1. Interpretación...", "nivelRiesgo": "critico" }
```

### `POST /api/bolivar` — Chat con datos reales

```json
{
  "endpoint": "https://www.datos.gov.co/api/odata/v4/vkkq-3tid",
  "dataset":  "Prevalencia de Diabetes Mellitus (18–69 años) — Bolívar",
  "question": "¿Cuál es la prevalencia más alta registrada?"
}
```

**Respuesta:**
```json
{
  "respuesta":   "Según los datos, la prevalencia más alta...",
  "registros":   28,
  "advertencia": "opcional — si los datos no estuvieron disponibles"
}
```

### `GET /health`

```json
{ "status": "ok", "version": "1.1" }
```

---

## Base de datos

SQLite se crea automáticamente en `backend/jvision.db` al arrancar.

```sql
simulacion     -- parámetros de cada simulación ejecutada
resultado_ia   -- respuesta IA, nivel de riesgo, tokens usados
usuario        -- tabla para futura autenticación
```

Explorador visual recomendado: **DB Browser for SQLite** (gratuito).

---

## Changelog

### v1.2
- Nueva sección **Datos Bolívar**: chat con IA sobre 5 datasets oficiales de datos.gov.co
- Endpoint `POST /api/bolivar` con fetch OData en tiempo real
- Reintentos automáticos (3 intentos) si el endpoint tarda o falla
- Fallback con contexto general cuando el dataset no responde
- Truncado inteligente de datos para no exceder límite de tokens de Groq
- Sugerencias de preguntas por dataset
- Historial de chat por dataset (se mantiene al cambiar entre ellos)

### v1.1
- Integración IA con Groq (Llama 3.3 70B) — gratuito sin tarjeta
- Base de datos SQLite con sql.js (compatible Windows)
- Markdown renderer con colores semánticos por nivel de riesgo
- Loader animado con mensajes rotativos
- Detección de nivel de riesgo: crítico / alto / moderado / bajo

### v1.0
- Landing page con diseño dark mode
- Simulador interactivo con 4 escenarios y 20+ variables
- Proyecciones 2025–2075 con Chart.js
- Métricas, barras de riesgo y línea temporal por escenario

---

## Licencia

MIT © 2025 JVision AI