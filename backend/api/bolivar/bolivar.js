const express     = require('express');
const router      = express.Router();
const { analyzeBolivar } = require('../../controllers/bolivarController');

router.post('/', analyzeBolivar);

module.exports = router;