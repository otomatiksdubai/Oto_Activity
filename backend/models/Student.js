const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  grade: String,
  schoolName: String,
  parentPhone: {
    type: String,
    required: true
  },
  courseEnrolled: String,
  studentId: {
    type: String,
    unique: true,
    sparse: true // Allow nulls while maintaining uniqueness for non-nulls
  },
  enrolledSessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }],
  lessonPlan: [{
    topic: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    completedAt: Date,
    remarks: String
  }],
  level: {
    type: Number,
    default: 1
  },
  levelHistory: [{
    level: Number,
    course: String,
    date: { type: Date, default: Date.now },
    remarks: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', studentSchema);
