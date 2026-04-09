const Job = require('../models/Job');
const Candidate = require('../models/Candidate');

// GET /api/admin/jobs
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/admin/jobs
const createJob = async (req, res) => {
  try {
    const newJob = new Job(req.body);
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create job' });
  }
};

// GET /api/admin/candidates
const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/admin/candidates
const createCandidate = async (req, res) => {
  try {
    const newCandidate = new Candidate(req.body);
    const savedCandidate = await newCandidate.save();
    res.status(201).json(savedCandidate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create candidate' });
  }
};

module.exports = { getJobs, createJob, getCandidates, createCandidate };
