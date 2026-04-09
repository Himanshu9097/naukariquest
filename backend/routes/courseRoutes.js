const express = require('express');
const router = express.Router();
const { searchCourses } = require('../controllers/courseController');

// GET /api/courses/search?interest=react&type=all
router.get('/search', searchCourses);

module.exports = router;
