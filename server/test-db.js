const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

console.log('MONGO_URI:', process.env.MONGO_URI ? 'Found (' + process.env.MONGO_URI.substring(0, 30) + '...)' : 'MISSING');

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 })
  .then(() => {
    console.log('SUCCESS: MongoDB connected!');
    process.exit(0);
  })
  .catch(e => {
    console.log('FAILED:', e.message);
    process.exit(1);
  });
