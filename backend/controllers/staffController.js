const Staff = require('../models/Staff');
const User = require('../models/User');

exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().populate('userId');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff', error: error.message });
  }
};

exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).populate('userId');
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff', error: error.message });
  }
};

exports.createStaff = async (req, res) => {
  try {
    // Only Admin can add staff
    if (req.role !== 'admin') {
      return res.status(403).json({ message: 'Only Admin can add staff members' });
    }

    const { name, email, phone, role, specialization } = req.body;

    // 1. Automatically create a User account
    // Username: Staff Name, Password: Phone
    let userId = null;
    const existingUser = await User.findOne({ username: name });
    if (!existingUser) {
      const newUser = new User({
        username: name,
        password: phone,
        role: role || 'trainer'
      });
      const savedUser = await newUser.save();
      userId = savedUser._id;
    } else {
      userId = existingUser._id;
    }

    // 2. Create the Staff record
    const staff = new Staff({
      name,
      email,
      phone,
      role,
      specialization,
      userId
    });

    await staff.save();
    res.status(201).json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Error creating staff', error: error.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    // Only Admin can update staff
    if (req.role !== 'admin') {
      return res.status(403).json({ message: 'Only Admin can update staff members' });
    }

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Error updating staff', error: error.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    // Only Admin can delete staff
    if (req.role !== 'admin') {
      return res.status(403).json({ message: 'Only Admin can remove staff members. Access Denied.' });
    }

    const staffMember = await Staff.findByIdAndDelete(req.params.id);
    if (!staffMember) {
      return res.status(404).json({ message: 'Staff member not found or already deleted' });
    }

    // Also delete the associated user account
    if (staffMember.userId) {
      await User.findByIdAndDelete(staffMember.userId);
    }

    res.json({ message: 'Staff member deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting staff', error: error.message });
  }
};
