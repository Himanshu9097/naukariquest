const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  jobId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  recruiterId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:         { type: String, enum: ['interview', 'exam'], required: true },
  title:        { type: String, required: true },
  description:  { type: String },
  date:         { type: Date, required: true },
  time:         { type: String, required: true },
  location:     { type: String },
  link:         { type: String },
  candidates:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status:       { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  createdAt:    { type: Date, default: Date.now },
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
