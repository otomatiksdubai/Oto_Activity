require('dotenv').config();
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;

async function test() {
    try {
        console.log('Testing NEW cluster connection...');
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('SUCCESS!');
        process.exit(0);
    } catch (err) {
        console.error('FAILURE!');
        console.error(err.message);
        process.exit(1);
    }
}
test();
