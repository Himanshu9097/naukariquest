const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  jobId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidateId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:       { type: String, enum: ['applied', 'shortlisted', 'interview', 'exam', 'hired', 'rejected'], default: 'applied' },
  coverLetter:  { type: String },
  resumeUrl:    { type: String },
  atsScore:     { type: Number },
  createdAt:    { type: Date, default: Date.now },
});

module.exports = mongoose.model('Application', ApplicationSchema);
