const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../config/db');
const Book = require('../models/Book');
const mongoose = require('mongoose');

const run = async () => {
  await connectDB();
  const count = await Book.countDocuments();
  console.log('bookCount', count);
  const book = await Book.findOne().lean();
  console.log('sampleBook', book ? {
    title: book.title,
    authors: book.authors,
    publisherName: book.publisherName || book.publisher,
    categories: book.categories,
    ratingsCount: book.ratingsCount,
    averageRating: book.averageRating,
  } : null);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
