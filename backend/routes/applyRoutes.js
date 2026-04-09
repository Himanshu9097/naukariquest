const express = require('express');
const router = express.Router();
const { generateApplication } = require('../controllers/applyController');

// POST /api/apply/generate
router.post('/generate', generateApplication);

module.exports = router;
