const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists.');
        } else {
            const admin = new User({
                username: 'admin',
                password: 'password123',
                role: 'admin',
                email: 'admin@example.com'
            });
            await admin.save();
            console.log('Default admin user created successfully!');
            console.log('Username: admin');
            console.log('Password: password123');
        }
        process.exit();
    } catch (error) {
        console.error('Error seeding admin user:', error);
        process.exit(1);
    }
};

seedAdmin();
