const express = require('express');
const router = express.Router();
const { searchJobs } = require('../controllers/jobController');

// GET /api/jobs/search?q=react+developer&page=1&limit=6
router.get('/search', searchJobs);

module.exports = router;
