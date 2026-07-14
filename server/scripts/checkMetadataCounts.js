const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const Author = require('../models/Author');
const Publisher = require('../models/Publisher');
const Category = require('../models/Category');
const Review = require('../models/Review');

const run = async () => {
  await connectDB();
  const counts = await Promise.all([
    Author.countDocuments(),
    Publisher.countDocuments(),
    Category.countDocuments(),
    Review.countDocuments(),
  ]);
  console.log('authorCount', counts[0]);
  console.log('publisherCount', counts[1]);
  console.log('categoryCount', counts[2]);
  console.log('reviewCount', counts[3]);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
