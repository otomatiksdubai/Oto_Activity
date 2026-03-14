const mongoose = require('mongoose');
require('dotenv').config();

async function cleanGarbage() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/institute-portal');
    const collection = mongoose.connection.collection('sessions');
    const result = await collection.deleteMany({ session: { $exists: true } });
    console.log('Cleaned up garbage HTTP sessions from sessions collection: ', result.deletedCount);
    await mongoose.disconnect();
}
cleanGarbage();
