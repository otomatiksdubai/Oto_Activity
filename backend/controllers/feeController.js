const Fee = require('../models/Fee');
const Student = require('../models/Student');

exports.getAllFees = async (req, res) => {
  try {
    let query = {};

    // If Parent, filter by student(s) sharing their contact number
    if (req.role === 'parent') {
      const loggedInStudent = await Student.findOne({ name: new RegExp(`^${req.username}$`, 'i') });
      const parentStudents = loggedInStudent ? await Student.find({ parentPhone: loggedInStudent.parentPhone }) : [];
      const parentStudentIds = parentStudents.map(s => s._id);
      const parentStudentNames = parentStudents.map(s => s.name);
      
      query = {
        $or: [
          { student: { $in: parentStudentIds } },
          { studentName: { $in: parentStudentNames } }
        ]
      };
    }

    const fees = await Fee.find(query)
      .populate('student');
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching fees', error: error.message });
  }
};

exports.getFeesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const fees = await Fee.find({ student: studentId });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching fees', error: error.message });
  }
};

exports.createFee = async (req, res) => {
  try {
    const { studentId, studentName, course, amount, discount, status } = req.body;

    // 1. Generate new Invoice ID (OTO-260001, OTO-260002, etc.)
    let nextNum = 260001;
    const allOtoFees = await Fee.find({ invoiceId: /^OTO-/ }, 'invoiceId');
    if (allOtoFees.length > 0) {
      const numbers = allOtoFees.map(f => {
        const match = f.invoiceId && f.invoiceId.match(/^OTO-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      });
      const maxNum = Math.max(...numbers, 0);
      if (maxNum >= 260001) {
        nextNum = maxNum + 1;
      }
    }
    const generatedId = 'OTO-' + nextNum;

    const fee = new Fee({
      student: studentId,
      studentName,
      course,
      amount,
      discount,
      status,
      invoiceId: generatedId
    });

    await fee.save();
    res.status(201).json(fee);
  } catch (error) {
    res.status(500).json({ message: 'Error creating fee', error: error.message });
  }
};

exports.recordPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method } = req.body;

    const fee = await Fee.findById(id);

    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    fee.payments.push({
      amount,
      date: new Date(),
      method
    });

    fee.paidAmount += amount;
    const totalDue = fee.amount - (fee.discount || 0);

    if (fee.paidAmount >= totalDue) {
      fee.status = 'paid';
    } else if (fee.paidAmount > 0) {
      fee.status = 'partial';
    }

    await fee.save();
    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: 'Error recording payment', error: error.message });
  }
};

exports.updateFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: 'Error updating fee', error: error.message });
  }
};

exports.deleteFee = async (req, res) => {
  try {
    // Only Admin or Staff can delete invoices
    if (req.role === 'parent') {
      return res.status(403).json({ message: 'Parents cannot delete invoices' });
    }

    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting fee', error: error.message });
  }
};
