require('dotenv').config();

const express       = require('express');
const cors          = require('cors');
const analyzeRouter = require('./api/analyze/analyze');
const bolivarRouter = require('./api/bolivar/bolivar');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/analyze', analyzeRouter);
app.use('/api/bolivar', bolivarRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', version: '1.1' }));

app.listen(PORT, () => {
  console.log(`JVision AI backend corriendo en http://localhost:${PORT}`);
});