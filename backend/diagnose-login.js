const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        const username = 'admin';
        const passwordInput = 'password123';
        const role = 'admin';

        console.log('--- Database Check ---');
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User NOT found in DB');
            process.exit(1);
        }

        console.log('User found in DB:', {
            id: user._id,
            username: user.username,
            role: user.role,
            hashedPassword: user.password
        });

        console.log('--- Bcrypt Match Check ---');
        const isMatch = await bcrypt.compare(passwordInput, user.password);
        console.log('Bcrypt manual match result:', isMatch);

        const modelMatch = await user.matchPassword(passwordInput);
        console.log('User model match method result:', modelMatch);

        process.exit(0);
    } catch (error) {
        console.error('Error during test:', error);
        process.exit(1);
    }
};

testLogin();
