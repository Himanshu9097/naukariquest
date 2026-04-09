const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  title: { type: String },
  experience: { type: String },
  skills: [{ type: String }],
  summary: { type: String },
  linkedin: { type: String },
  github: { type: String },
  education: { type: String },
  ats_score: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Candidate', CandidateSchema);
