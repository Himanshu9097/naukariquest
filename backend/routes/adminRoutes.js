const express = require('express');
const router = express.Router();
const { getJobs, createJob, getCandidates, createCandidate } = require('../controllers/adminController');

router.get('/jobs', getJobs);
router.post('/jobs', createJob);
router.get('/candidates', getCandidates);
router.post('/candidates', createCandidate);

module.exports = router;
