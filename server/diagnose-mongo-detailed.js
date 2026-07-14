const mongoose = require('mongoose');
const dns = require('dns').promises;
require('dotenv').config();

console.log('🔍 DETAILED MONGODB DIAGNOSTIC\n');
console.log('━'.repeat(60));

console.log('\n1️⃣ CONFIGURATION CHECK:');
console.log(`   URI: ${process.env.MONGO_URI}`);
console.log(`   Node Env: ${process.env.NODE_ENV}`);

const uri = process.env.MONGO_URI;
const match = uri.match(/@([^/?]+)/);
const host = match ? match[1] : 'unknown';
console.log(`   Host: ${host}`);

console.log('\n2️⃣ DNS RESOLUTION TEST:');
dns.resolve(host)
  .then(addresses => {
    console.log(`   ✅ DNS Resolved: ${addresses.join(', ')}`);
    console.log('\n3️⃣ ATTEMPTING MONGODB CONNECTION...\n');
    
    // Try connection with shorter timeout
    const timeoutMs = 8000;
    mongoose.connect(process.env.MONGO_URI, {
      connectTimeoutMS: timeoutMs,
      serverSelectionTimeoutMS: timeoutMs,
      socketTimeoutMS: timeoutMs,
    })
    .then(() => {
      console.log('✅ ✅ ✅ MONGODB CONNECTED SUCCESSFULLY! ✅ ✅ ✅\n');
      console.log(`   Host: ${mongoose.connection.host}`);
      console.log(`   Database: ${mongoose.connection.name}`);
      console.log(`   State: Connected (${mongoose.connection.readyState})`);
      process.exit(0);
    })
    .catch(error => {
      console.log('❌ CONNECTION FAILED:');
      console.log(`   Error: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      
      if (error.message.includes('ECONNREFUSED')) {
        console.log('\n   → MongoDB server not running');
      } else if (error.message.includes('authentication failed')) {
        console.log('\n   → Authentication failed - check credentials');
      } else if (error.message.includes('getaddrinfo')) {
        console.log('\n   → Network error - check firewall/proxy');
      }
      
      process.exit(1);
    });
  })
  .catch(error => {
    console.log(`   ❌ DNS FAILED: ${error.message}`);
    console.log('\n   Cannot resolve MongoDB host');
    console.log('   Check your connection string and network settings');
    process.exit(1);
  });

setTimeout(() => {
  console.log('\n⏱️ CONNECTION TIMEOUT');
  console.log('   MongoDB cluster not responding within 8 seconds');
  console.log('\n   Possible causes:');
  console.log('   • Cluster is down or unreachable');
  console.log('   • Network/firewall is blocking access');
  console.log('   • IP address not whitelisted in MongoDB Atlas');
  console.log('   • Cluster is in a different region');
  process.exit(1);
}, 10000);
