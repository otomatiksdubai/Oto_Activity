const Session = require('../models/Session');
const Student = require('../models/Student');

exports.getAllSessions = async (req, res) => {
  try {
    let query = {};

    // If Parent, filter by student
    if (req.role === 'parent') {
      const student = await Student.findOne({ name: req.username });
      if (student) {
        query = { student: student._id };
      } else {
        return res.json([]);
      }
    }

    // If Trainer, filter by trainer's staff ID
    if (req.role === 'trainer') {
      const Staff = require('../models/Staff');
      const User = require('../models/User');
      const user = await User.findOne({ username: req.username });
      if (user) {
        const staffDoc = await Staff.findOne({ userId: user._id });
        if (staffDoc) {
          query = { trainer: staffDoc._id };
        } else {
          // If staff record not properly linked, try finding by name
          const staffByName = await Staff.findOne({ name: req.username });
          if (staffByName) {
            query = { trainer: staffByName._id };
          } else {
            return res.json([]);
          }
        }
      } else {
         return res.json([]);
      }
    }

    const sessions = await Session.find(query)
      .populate('student')
      .populate('trainer');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sessions', error: error.message });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('student')
      .populate('trainer');
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching session', error: error.message });
  }
};

exports.createSession = async (req, res) => {
  try {
    const { studentId, program, room, day, time, trainerId, duration, totalHours } = req.body;

    const session = new Session({
      student: studentId,
      program,
      room,
      day,
      time,
      trainer: trainerId,
      duration,
      totalHours,
      remainingHours: totalHours
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Error creating session', error: error.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Error updating session', error: error.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    if (req.role !== 'admin' && req.role !== 'trainer') {
      return res.status(403).json({ message: 'Only Admin or Trainer can remove sessions. Access Denied.' });
    }

    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found or already deleted.' });
    }

    res.json({ message: 'Session deleted successfully', id: session._id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting session', error: error.message });
  }
};
