const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  studentName: String, // Manual input support from UI
  course: String,
  amount: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  dueDate: Date,
  status: {
    type: String,
    enum: ['paid', 'unpaid', 'partial', 'pending'],
    default: 'unpaid'
  },
  invoiceId: {
    type: String,
    unique: true,
    sparse: true
  },
  description: String,
  payments: [{
    amount: Number,
    date: Date,
    method: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Fee', feeSchema);
