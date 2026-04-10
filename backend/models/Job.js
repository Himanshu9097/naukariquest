const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: String, required: true },
  salary: { type: String },
  skills: [{ type: String }],
  experience: { type: String },
  type: { type: String },
  description: { type: String },
  apply_link: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Job', JobSchema);
