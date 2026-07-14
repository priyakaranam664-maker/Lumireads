const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Testing MongoDB Connection...');
console.log('MONGO_URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
})
.then(() => {
    console.log('✅ MongoDB Atlas Connected Successfully!');
    console.log('Connection Host:', mongoose.connection.host);
    console.log('Database:', mongoose.connection.name);
    console.log('State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting');
    process.exit(0);
})
.catch((error) => {
    console.error('❌ MongoDB Connection Failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.message.includes('ECONNREFUSED')) {
        console.log('\n⚠️ Connection refused to localhost. MongoDB Atlas URI might not be configured.');
    }
    
    process.exit(1);
});

setTimeout(() => {
    console.error('⏱️ Connection timeout - MongoDB not responding');
    process.exit(1);
}, 10000);
