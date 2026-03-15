const Fee = require('../models/Fee');
const Report = require('../models/Report');
const Student = require('../models/Student');

exports.getSalesReport = async (req, res) => {
  try {
    const { period } = req.query; // 'daily' or 'monthly'
    
    let start = new Date();
    let end = new Date();
    
    if (period === 'daily') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (period === 'monthly') {
      start = new Date(start.getFullYear(), start.getMonth(), 1);
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // 1. Fetch New Admissions
    const newAdmissions = await Student.find({
      createdAt: { $gte: start, $lte: end }
    });

    // 2. Fetch Invoices created in period (Sales)
    const newInvoices = await Fee.find({
      createdAt: { $gte: start, $lte: end }
    });

    // 3. Fetch Payments received in period (Collections)
    // We search across all fees for payments within the date range
    const allFeesWithPayments = await Fee.find({
      'payments.date': { $gte: start, $lte: end }
    });

    let totalSales = 0;
    let totalCollections = 0;
    const reportData = [];

    // Process Invoices for Sales
    newInvoices.forEach(fee => {
      const invoiceTotal = fee.amount - (fee.discount || 0);
      totalSales += invoiceTotal;
    });

    // Process Payments for Collections & detailed audit
    allFeesWithPayments.forEach(fee => {
      fee.payments.forEach(payment => {
        if (payment.date >= start && payment.date <= end) {
          totalCollections += payment.amount;
          reportData.push({
            type: 'PAYMENT',
            date: payment.date,
            student: fee.studentName,
            course: fee.course,
            amount: payment.amount,
            method: payment.method,
            invoiceId: fee.invoiceId
          });
        }
      });
    });

    // Add admissions to report data for the list
    newAdmissions.forEach(student => {
      reportData.push({
        type: 'ADMISSION',
        date: student.createdAt,
        student: student.name,
        course: student.courseEnrolled || 'N/A',
        amount: 0,
        method: '-',
        invoiceId: student.studentId || 'NEW'
      });
    });

    // Sort reportData by date
    reportData.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      period,
      start,
      end,
      totalSales, // Value of new invoices
      totalCollections, // Actual cash received
      newAdmissionCount: newAdmissions.length,
      reportData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};

exports.saveReport = async (req, res) => {
  try {
    const { title, type, dateRange, totalAmount, data } = req.body;
    
    const report = new Report({
      title,
      type,
      dateRange,
      totalAmount,
      data,
      generatedBy: req.username
    });

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error saving report', error: error.message });
  }
};

exports.getReportHistory = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching report history', error: error.message });
  }
};
