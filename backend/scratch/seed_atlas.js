const mongoose = require('mongoose');
const User = require('../models/User');

const uri = 'mongodb://otomatiksdubai:Oto2025@ac-fo8kqna-shard-00-00.l0zlp7n.mongodb.net:27017,ac-fo8kqna-shard-00-01.l0zlp7n.mongodb.net:27017,ac-fo8kqna-shard-00-02.l0zlp7n.mongodb.net:27017/institute-portal?ssl=true&replicaSet=atlas-o3cmyc-shard-0&authSource=admin&appName=Otm';

async function seedProduction() {
    try {
        console.log('Connecting to production database...');
        await mongoose.connect(uri);
        console.log('Connected!');

        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists in Atlas.');
        } else {
            const admin = new User({
                username: 'admin',
                password: 'password123',
                role: 'admin',
                email: 'admin@example.com'
            });
            await admin.save();
            console.log('Admin user created in production Atlas DB!');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error seeding Atlas DB:', error);
        process.exit(1);
    }
}

seedProduction();
