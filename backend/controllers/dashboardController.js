const Job = require('../models/Job');
const Application = require('../models/Application');
const Schedule = require('../models/Schedule');
const ResumeAnalysis = require('../models/ResumeAnalysis');

// ─── RECRUITER: Get my posted jobs ──────────────────────────────────────────
const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch jobs' }); }
};

// ─── RECRUITER: Create a new job ────────────────────────────────────────────
const createRecruiterJob = async (req, res) => {
  try {
    const job = new Job(req.body);
    const saved = await job.save();
    res.status(201).json(saved);
  } catch (e) { res.status(500).json({ error: 'Failed to create job' }); }
};

// ─── RECRUITER: Update job ──────────────────────────────────────────────────
const updateRecruiterJob = async (req, res) => {
  try {
    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Job not found' });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: 'Failed to update job' }); }
};

// ─── RECRUITER: Delete job ──────────────────────────────────────────────────
const deleteRecruiterJob = async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed to delete job' }); }
};

// ─── RECRUITER: Get all applications for their jobs ─────────────────────────
const getApplications = async (req, res) => {
  try {
    const apps = await Application.find()
      .populate('jobId', 'title company location')
      .populate('candidateId', 'name email')
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch applications' }); }
};

// ─── RECRUITER: Update application status ───────────────────────────────────
const updateApplicationStatus = async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(app);
  } catch (e) { res.status(500).json({ error: 'Failed to update status' }); }
};

// ─── RECRUITER: Schedule interview/exam ─────────────────────────────────────
const createSchedule = async (req, res) => {
  try {
    const schedule = new Schedule(req.body);
    const saved = await schedule.save();
    res.status(201).json(saved);
  } catch (e) { res.status(500).json({ error: 'Failed to create schedule' }); }
};

const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('jobId', 'title company')
      .sort({ date: 1 });
    res.json(schedules);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch schedules' }); }
};

const updateSchedule = async (req, res) => {
  try {
    const updated = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: 'Failed to update schedule' }); }
};

const deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Schedule deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed to delete schedule' }); }
};

// ─── RECRUITER: Dashboard stats ─────────────────────────────────────────────
const getRecruiterStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const totalApps = await Application.countDocuments();
    const shortlisted = await Application.countDocuments({ status: 'shortlisted' });
    const interviews = await Schedule.countDocuments({ type: 'interview' });
    const exams = await Schedule.countDocuments({ type: 'exam' });
    const hired = await Application.countDocuments({ status: 'hired' });
    res.json({ totalJobs, totalApps, shortlisted, interviews, exams, hired });
  } catch (e) { res.status(500).json({ error: 'Stats fetch failed' }); }
};

// ─── CANDIDATE: Apply for a job ─────────────────────────────────────────────
const applyForJob = async (req, res) => {
  try {
    const existing = await Application.findOne({ jobId: req.body.jobId, candidateId: req.body.candidateId });
    if (existing) return res.status(400).json({ error: 'Already applied for this job' });
    const app = new Application(req.body);
    const saved = await app.save();
    res.status(201).json(saved);
  } catch (e) { res.status(500).json({ error: 'Failed to apply' }); }
};

// ─── CANDIDATE: Get my applications ─────────────────────────────────────────
const getCandidateApplications = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const mongoose = require('mongoose');
    const isValid = mongoose.Types.ObjectId.isValid(candidateId);
    const filter = isValid ? { candidateId } : {};
    const apps = await Application.find(filter)
      .populate('jobId', 'title company location salary type')
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch applications' }); }
};

// ─── CANDIDATE: Dashboard stats ─────────────────────────────────────────────
const getCandidateStats = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const mongoose = require('mongoose');
    const isValid = mongoose.Types.ObjectId.isValid(candidateId);
    const filter = isValid ? { candidateId } : {};
    const totalApps = await Application.countDocuments(filter);
    const shortlisted = await Application.countDocuments({ ...filter, status: 'shortlisted' });
    const interviews = await Application.countDocuments({ ...filter, status: 'interview' });
    const hired = await Application.countDocuments({ ...filter, status: 'hired' });
    const analysisCount = await ResumeAnalysis.countDocuments();
    const latestAnalysis = await ResumeAnalysis.findOne().sort({ createdAt: -1 });
    res.json({ totalApps, shortlisted, interviews, hired, analysisCount, latestAtsScore: latestAnalysis?.ats_score ?? null });
  } catch (e) { res.status(500).json({ error: 'Stats fetch failed' }); }
};

// ─── CANDIDATE: Get upcoming schedules ──────────────────────────────────────
const getCandidateSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ status: 'scheduled', date: { $gte: new Date() } })
      .populate('jobId', 'title company')
      .sort({ date: 1 });
    res.json(schedules);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch schedules' }); }
};

module.exports = {
  getRecruiterJobs, createRecruiterJob, updateRecruiterJob, deleteRecruiterJob,
  getApplications, updateApplicationStatus,
  createSchedule, getSchedules, updateSchedule, deleteSchedule,
  getRecruiterStats,
  applyForJob, getCandidateApplications, getCandidateStats, getCandidateSchedules,
};
