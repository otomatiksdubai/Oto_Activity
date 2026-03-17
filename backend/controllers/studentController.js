const Student = require('../models/Student');
const User = require('../models/User');

exports.getAllStudents = async (req, res) => {
  try {
    let query = {};

    // If user is a parent, they only see their own students (matched by username)
    if (req.role === 'parent') {
      query = { name: req.username };
    }

    const students = await Student.find(query).populate('enrolledSessions');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('enrolledSessions');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Security check for parents
    if (req.role === 'parent' && student.name !== req.username) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student', error: error.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { name, grade, schoolName, parentPhone, courseEnrolled } = req.body;

    // 1. Generate new Student ID (OTO001, OTO002, etc.)
    let nextNum = 1;
    const allOtoStudents = await Student.find({ studentId: /^OTO/ }, 'studentId');
    if (allOtoStudents.length > 0) {
      const numbers = allOtoStudents.map(s => {
        const match = s.studentId && s.studentId.match(/^OTO(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      });
      nextNum = Math.max(...numbers, 0) + 1;
    }
    const generatedId = 'OTO' + nextNum.toString().padStart(3, '0');

    // 2. Create the Student record
    const student = new Student({
      name,
      grade,
      schoolName,
      parentPhone,
      courseEnrolled,
      studentId: generatedId
    });

    await student.save();

    // 2. Automatically create a Parent User account
    // Username: Student Name, Password: Parent Phone
    const existingUser = await User.findOne({ username: name });
    if (!existingUser) {
      const parentUser = new User({
        username: name,
        password: parentPhone,
        role: 'parent'
      });
      await parentUser.save();
    }

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error creating student', error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const oldStudent = await Student.findById(req.params.id);
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // If name changed, update the parent user account username to keep login in sync
    if (oldStudent && req.body.name && oldStudent.name !== oldStudent.name) {
       // Wait, req.body.name vs oldStudent.name comparison
    }
    
    if (oldStudent && req.body.name && oldStudent.name !== req.body.name) {
      const User = require('../models/User');
      await User.findOneAndUpdate(
        { username: oldStudent.name, role: 'parent' },
        { username: req.body.name }
      );
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error updating student', error: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    // Only Admin can delete students
    if (req.role !== 'admin') {
      return res.status(403).json({ message: 'Only Admin can remove students. Access Denied.' });
    }

    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found or already deleted' });
    }

    // Also delete the automatically created parent user
    await User.findOneAndDelete({ username: student.name, role: 'parent' });

    res.json({ message: 'Student deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student', error: error.message });
  }
};

exports.levelUp = async (req, res) => {
  try {
    const { id } = req.params;
    const { newLevel, course, remarks } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.level = newLevel;
    if (course) student.courseEnrolled = course;

    student.levelHistory.push({
      level: newLevel,
      course: course || student.courseEnrolled,
      date: new Date(),
      remarks
    });

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error updating level', error: error.message });
  }
};
