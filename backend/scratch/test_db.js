const mongoose = require('mongoose');

const uri = 'mongodb://otomatiksdubai:Oto2025@ac-fo8kqna-shard-00-00.l0zlp7n.mongodb.net:27017,ac-fo8kqna-shard-00-01.l0zlp7n.mongodb.net:27017,ac-fo8kqna-shard-00-02.l0zlp7n.mongodb.net:27017/institute-portal?ssl=true&replicaSet=atlas-o3cmyc-shard-0&authSource=admin&appName=Otm';

async function testConnection() {
    try {
        console.log('Attempting to connect to MongoDB Atlas...');
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('SUCCESS: Connected to MongoDB Atlas!');
        
        // Check collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in DB:', collections.map(c => c.name));
        
        process.exit(0);
    } catch (error) {
        console.error('FAILURE: Could not connect to MongoDB.');
        console.error('Error Details:', error.message);
        process.exit(1);
    }
}

testConnection();
