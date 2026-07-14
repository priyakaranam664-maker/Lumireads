require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const out = 'server/check_counts.log';
async function main(){
  try{
    await mongoose.connect(process.env.MONGO_URI);
    const Book = require('../models/Book');
    const Author = require('../models/Author');
    const Publisher = require('../models/Publisher');
    const Category = require('../models/Category');
    const Review = require('../models/Review');
    const counts = {
      books: await Book.countDocuments(),
      authors: await Author.countDocuments().catch(()=>null),
      publishers: await Publisher.countDocuments().catch(()=>null),
      categories: await Category.countDocuments().catch(()=>null),
      reviews: await Review.countDocuments().catch(()=>null),
    };
    fs.writeFileSync(out, new Date().toISOString() + ' ' + JSON.stringify(counts, null,2));
    const one = await Book.findOne().lean();
    fs.appendFileSync(out, '\nSAMPLE: ' + JSON.stringify(one ? {title: one.title, authors: one.authors, authorRef: one.author, category: one.category, publisherName: one.publisherName} : 'NO BOOK', null,2));
    console.log('Wrote', out);
    process.exit(0);
  }catch(e){
    fs.writeFileSync(out, 'ERROR: ' + e.message);
    console.error(e);
    process.exit(1);
  }
}
main();
