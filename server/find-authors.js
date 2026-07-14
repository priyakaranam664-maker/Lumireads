const mongoose = require('mongoose');
const Book = require('./models/Book');
const Author = require('./models/Author');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database.');
    
    const books = await Book.find().lean();
    const authors = await Author.find().lean();
    
    console.log(`Found ${books.length} books and ${authors.length} authors in DB.`);
    console.log('Fixing author relations...');
    
    let updatedCount = 0;
    for (const book of books) {
        let matchedAuthorId = null;
        for (const authorName of book.authors || []) {
            const found = authors.find(a => a.name.toLowerCase() === authorName.toLowerCase());
            if (found) {
                matchedAuthorId = found._id;
                break;
            }
        }
        
        if (matchedAuthorId) {
            await Book.findByIdAndUpdate(book._id, { author: matchedAuthorId });
            updatedCount++;
        }
    }
    
    console.log(`✅ Success! Updated ${updatedCount} books with correct author references.`);
    process.exit(0);
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
