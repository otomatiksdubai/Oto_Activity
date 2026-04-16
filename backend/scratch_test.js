require('dotenv').config();
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;

async function test() {
    try {
        console.log('Connecting to:', uri.replace(/:([^@]+)@/, ':****@')); // Hide password
        await mongoose.connect(uri, { 
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000 
        });
        console.log('SUCCESS: Connected to MongoDB Atlas!');
        process.exit(0);
    } catch (err) {
        console.error('FAILURE: Could not connect.');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        if (err.message.includes('IP')) {
            console.error('Suggestion: Check MongoDB Atlas IP Whitelist.');
        }
        process.exit(1);
    }
}
test();
