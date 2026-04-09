const express = require('express');
const router = express.Router();
const { extractResume, analyzeResume, rewriteResume } = require('../controllers/resumeController');

// POST /api/resume/extract  (multipart/form-data with "file" field)
router.post('/extract', ...extractResume);

// POST /api/resume/analyze
router.post('/analyze', analyzeResume);

// POST /api/resume/rewrite
router.post('/rewrite', rewriteResume);

module.exports = router;
