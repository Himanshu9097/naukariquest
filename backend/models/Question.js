const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'aptitude', 'dsa', 'verbal', 'react'
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  explanation: { type: String }
});

module.exports = mongoose.model('Question', QuestionSchema);
