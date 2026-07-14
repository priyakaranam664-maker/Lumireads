const mongoose = require('mongoose');
const Category = require('./models/Category');
const Book = require('./models/Book');
require('dotenv').config();

async function run() {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    console.time('fetch-all-data');
    const categories = await Category.find({ isActive: true }).sort('name').lean();
    const books = await Book.find({ isActive: true }).select('categories category').lean();
    console.timeEnd('fetch-all-data');

    console.log(`Found ${categories.length} categories and ${books.length} books.`);

    console.time('optimize-counts-calculation');
    
    // Step 1: Build map of category key -> Set of book IDs
    const bookMatches = {};
    for (const book of books) {
        const bookId = book._id.toString();
        if (book.category) {
            const catIdStr = book.category.toString();
            if (!bookMatches[catIdStr]) bookMatches[catIdStr] = new Set();
            bookMatches[catIdStr].add(bookId);
        }
        if (book.categories && Array.isArray(book.categories)) {
            for (const name of book.categories) {
                if (name) {
                    const nameKey = name.trim().toLowerCase();
                    if (!bookMatches[nameKey]) bookMatches[nameKey] = new Set();
                    bookMatches[nameKey].add(bookId);
                }
            }
        }
    }

    // Step 2: Calculate count for each category
    for (let cat of categories) {
        const matchedBookIds = new Set();
        if (cat._id) {
            const catIdStr = cat._id.toString();
            const ids = bookMatches[catIdStr];
            if (ids) {
                for (const id of ids) matchedBookIds.add(id);
            }
        }
        if (cat.name) {
            const nameKey = cat.name.trim().toLowerCase();
            const ids = bookMatches[nameKey];
            if (ids) {
                for (const id of ids) matchedBookIds.add(id);
            }
        }
        cat.bookCount = matchedBookIds.size;
    }
    
    console.timeEnd('optimize-counts-calculation');

    console.log('Sample counts:');
    for (let i = 0; i < Math.min(categories.length, 10); i++) {
        console.log(`Category: ${categories[i].name}, Books: ${categories[i].bookCount}`);
    }

    process.exit(0);
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
