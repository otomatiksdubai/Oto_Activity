const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'monthly', 'custom'],
    required: true
  },
  dateRange: {
    start: Date,
    end: Date
  },
  totalAmount: {
    type: Number,
    required: true
  },
  generatedBy: {
    type: String,
    required: true
  },
  data: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema);
