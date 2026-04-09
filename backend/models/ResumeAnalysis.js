const mongoose = require('mongoose');

const ResumeAnalysisSchema = new mongoose.Schema({
  name: { type: String, default: 'Unknown' },
  email: { type: String },
  phone: { type: String },
  ats_score: { type: Number, default: 0 },
  predicted_field: { type: String },
  user_level: { type: String },
  skills: [{ type: String }],
  file_url: { type: String },
  target_job: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ResumeAnalysis', ResumeAnalysisSchema);
