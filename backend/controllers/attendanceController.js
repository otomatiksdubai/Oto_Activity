const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Session = require('../models/Session');

exports.getAllAttendance = async (req, res) => {
  try {
    let query = {};

    // If Parent, filter by student(s) matching their username (case-insensitive)
    if (req.role === 'parent') {
      const parentStudents = await Student.find({ name: new RegExp(`^${req.username}$`, 'i') });
      if (parentStudents.length > 0) {
        query = { student: { $in: parentStudents.map(s => s._id) } };
      } else {
        return res.json([]);
      }
    }

    const attendance = await Attendance.find(query)
      .populate('session')
      .populate('student');
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
};

exports.getAttendanceBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    let query = { session: sessionId };

    // Security check for parent
    if (req.role === 'parent') {
      const parentStudents = await Student.find({ name: new RegExp(`^${req.username}$`, 'i') });
      if (parentStudents.length > 0) {
        query.student = { $in: parentStudents.map(s => s._id) };
      } else {
        return res.json([]);
      }
    }

    const attendance = await Attendance.find(query)
      .populate('student');
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
};

exports.getAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    let query = { student: studentId };

    // Security check for parent
    if (req.role === 'parent') {
      const parentStudents = await Student.find({ name: new RegExp(`^${req.username}$`, 'i') });
      const parentStudentIds = parentStudents.map(s => s._id.toString());
      if (!parentStudentIds.includes(studentId)) {
        return res.json([]);
      }
    }

    const attendance = await Attendance.find(query)
      .populate('session')
      .populate('student')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { sessionId, studentId, date, status, remarks, topicsCovered } = req.body;

    // Use selected date or today, but set to current time for 'updating time properly'
    const markTime = date ? new Date(date) : new Date();
    
    // Improved 'today' detection for time update
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    
    if (date === todayStr) {
      markTime.setHours(today.getHours(), today.getMinutes(), today.getSeconds());
    }

    const startOfDay = new Date(markTime);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(markTime);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      session: sessionId,
      student: studentId,
      date: { $gte: startOfDay, $lte: endOfDay }
    };

    const existing = await Attendance.findOne(query);
    const sessionDoc = await Session.findById(sessionId);
    const hoursToDeduct = sessionDoc && sessionDoc.duration ? parseInt(sessionDoc.duration.split(' ')[0], 10) || 1 : 1;

    if (existing) {
      const oldStatus = existing.status;
      existing.status = status;
      existing.remarks = remarks;
      
      // Merge topics: keep existing ones + add new ones from this request
      const newlyCovered = topicsCovered || [];
      const currentlyRecorded = existing.topicsCovered || [];
      const allTopicsForThisSession = [...new Set([...currentlyRecorded, ...newlyCovered])];
      existing.topicsCovered = allTopicsForThisSession;
      
      existing.date = markTime; // Update the time to the latest mark action
      await existing.save();

      // Update student's lesson plan if status is present
      if (status === 'present' && allTopicsForThisSession.length > 0) {
        const student = await Student.findById(studentId);
        if (student && student.lessonPlan) {
          student.lessonPlan = student.lessonPlan.map(lp => {
            if (allTopicsForThisSession.includes(lp.topic)) {
              return { 
                ...lp.toObject ? lp.toObject() : lp, 
                status: 'completed', 
                completedAt: markTime,
                remarks: remarks // Always update to the latest remark
              };
            }
            return lp;
          });
          await student.save();
        }
      }

      // Adjust remaining hours if status changed
      if (sessionDoc) {
        if (oldStatus !== 'present' && status === 'present') {
          sessionDoc.remainingHours = Math.max(0, sessionDoc.remainingHours - hoursToDeduct);
          await sessionDoc.save();
        } else if (oldStatus === 'present' && status !== 'present') {
          sessionDoc.remainingHours += hoursToDeduct;
          await sessionDoc.save();
        }
      }

      return res.json(existing);
    }

    const attendance = new Attendance({
      session: sessionId,
      student: studentId,
      date: markTime,
      status,
      remarks,
      topicsCovered: topicsCovered || []
    });

    await attendance.save();

    // Update student's lesson plan if status is present
    if (status === 'present' && topicsCovered && topicsCovered.length > 0) {
      const student = await Student.findById(studentId);
      if (student && student.lessonPlan) {
        student.lessonPlan = student.lessonPlan.map(lp => {
          if (topicsCovered.includes(lp.topic)) {
            return { 
              ...lp.toObject ? lp.toObject() : lp, 
              status: 'completed', 
              completedAt: markTime,
              remarks: remarks 
            };
          }
          return lp;
        });
        await student.save();
      }
    }

    // Deduct remaining hours for new attendance if present
    if (status === 'present' && sessionDoc) {
      sessionDoc.remainingHours = Math.max(0, sessionDoc.remainingHours - hoursToDeduct);
      await sessionDoc.save();
    }

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error marking attendance', error: error.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error updating attendance', error: error.message });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Attendance deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting attendance', error: error.message });
  }
};
