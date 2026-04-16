const mongoose = require('mongoose');

const uri = 'mongodb+srv://otomatiksdubai:Oto2025@otm.l0zlp7n.mongodb.net/institute-portal?retryWrites=true&w=majority&appName=Otm';

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
