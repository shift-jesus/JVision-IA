# JVision AI

> Plataforma de simulación demográfica con análisis por inteligencia artificial.

![Version](https://img.shields.io/badge/version-1.1-4af4a8?style=flat-square)
![Node](https://img.shields.io/badge/node-18+-green?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

---

## ¿Qué es JVision AI?

JVision AI modela escenarios poblacionales hipotéticos con lógica causal en cadena. Ajustas parámetros demográficos con sliders, el sistema proyecta consecuencias hasta 2075 y una IA genera un análisis estructurado del impacto.

---

## Escenarios disponibles

| # | Escenario | Variables clave |
|---|-----------|-----------------|
| 01 | Declive poblacional / envejecimiento | Fecundidad, mortalidad, gasto social |
| 02 | Migración masiva | Emigración, inmigración, remesas |
| 03 | Colapso económico | PIB, desempleo, inflación, salud |
| 04 | Crecimiento acelerado | Fecundidad, urbanización, alimentación |

---

## Stack

**Frontend**
- HTML5 / CSS3 / Vanilla JS
- Chart.js 4.4 — gráficos de proyección
- Google Fonts: DM Serif Display, DM Mono, Syne

**Backend**
- Node.js + Express
- Groq SDK — IA gratuita (Llama 3.3 70B)
- sql.js — SQLite sin compilación nativa
- dotenv, cors, nodemon

---

## Estructura del proyecto

```
JVision.Offi/
├── backend/
│   ├── api/
│   │   └── analyze/
│   │       └── analyze.js          # Ruta POST /api/analyze
│   ├── controllers/
│   │   └── analyzeController.js    # Valida payload + detecta nivel de riesgo
│   ├── services/
│   │   └── claudeService.js        # Prompt builder + llamada a Groq
│   ├── db/
│   │   ├── db.js                   # SQLite: tablas, queries, persistencia
│   │   └── schema.sql              # Referencia del schema
│   ├── server.js                   # Entry point Express
│   ├── package.json
│   ├── .env.example                # Plantilla de variables de entorno
│   └── jvision.db                  # Base de datos (se crea automáticamente)
├── frontend/
│   └── index.html                  # App completa (HTML + CSS + JS)
├── shared/
│   └── constants.js                # Constantes compartidas
├── .gitignore
└── README.md
```

---

## Instalación y uso

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

Edita `.env` y agrega tu API key de Groq:

```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
PORT=3000
```

Obtén tu key gratis en: https://console.groq.com/keys

### 3. Arranca el servidor

```bash
npm run dev
```

Verás:
```
JVision AI backend corriendo en http://localhost:3000
```

### 4. Abre el frontend

Abre `frontend/index.html` directamente en el navegador o con cualquier servidor estático.

---

## API

### `POST /api/analyze`

**Body:**
```json
{
  "input": {
    "tipo": "declive",
    "fecundidad": 1.3,
    "poblacion": 50,
    "mayores65": 18,
    "gastoSocial": 20,
    "mortalidad": 9
  },
  "output": {
    "metricas": { "Población 2075": "38M" },
    "riesgos": { "Colapso pensiones": "87%" },
    "timeline": [{ "año": "2025–2035", "evento": "..." }]
  },
  "pregunta": "¿Qué pasaría en este escenario?"
}
```

**Respuesta:**
```json
{
  "analisis": "## 1. Interpretación del escenario\n...",
  "nivelRiesgo": "critico"
}
```

### `GET /health`

```json
{ "status": "ok", "version": "1.0" }
```

---

## Base de datos

SQLite se crea automáticamente en `backend/jvision.db` al arrancar el servidor.

```sql
simulacion     -- parámetros de cada simulación ejecutada
resultado_ia   -- respuesta de la IA, nivel de riesgo, tokens usados
usuario        -- tabla para futura autenticación
```

Para explorar la BD visualmente usa **DB Browser for SQLite** (gratuito).

---

## Changelog

### v1.1
- Integración IA con Groq (Llama 3.3 70B) — gratuito sin tarjeta
- Base de datos SQLite con sql.js (compatible Windows sin compilación)
- Markdown renderer con colores semánticos por nivel de riesgo
- Loader animado con mensajes rotativos
- Guardado automático de simulaciones y análisis
- Detección de nivel de riesgo: crítico / alto / moderado / bajo

### v1.0
- Landing page completa con diseño dark mode
- Simulador interactivo con 4 escenarios y 20+ variables
- Proyecciones 2025–2075 con Chart.js
- Métricas, barras de riesgo y línea temporal por escenario

---

## Licencia

MIT © 2025 JVision AI