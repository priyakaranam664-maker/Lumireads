const path = require('path');
const fs = require('fs');

console.log('🔍 Diagnosing .env loading...\n');

const envPath = path.join(__dirname, '.env');
console.log('Expected .env path:', envPath);
console.log('File exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');
    const mongoLine = lines.find(l => l.includes('MONGO_URI'));
    console.log('First MONGO_URI line in file:', mongoLine);
}

console.log('\n📋 Loading dotenv...\n');
require('dotenv').config({ path: envPath });

console.log('process.env.MONGO_URI:', process.env.MONGO_URI);
console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
console.log('process.env.PORT:', process.env.PORT);

// Now test the connection
console.log('\n🔌 Testing MongoDB Connection...\n');

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
})
.then(() => {
    console.log('✅ MongoDB Connected!');
    console.log('Host:', mongoose.connection.host);
    console.log('Database:', mongoose.connection.name);
    process.exit(0);
})
.catch((error) => {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
        console.log('\n⚠️ MongoDB is not running on localhost:27017');
        console.log('To fix, choose one of these options:');
        console.log('1. Install MongoDB locally and start it');
        console.log('2. Ensure MongoDB Atlas cluster is accessible');
        console.log('3. Check network/firewall settings');
    }
    
    process.exit(1);
});

setTimeout(() => {
    console.error('⏱️ Timeout - no response from MongoDB');
    process.exit(1);
}, 10000);
