const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  program: String,
  room: String,
  day: String,
  time: String,
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  duration: String,
  totalHours: Number,
  remainingHours: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Session', sessionSchema);
