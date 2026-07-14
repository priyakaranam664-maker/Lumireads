const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { fetchGoogleBooksByCategory } = require('../services/googleBooksService');
const { fetchOpenLibraryBooksByCategory } = require('../services/openLibraryService');

const CATEGORIES = [
    'Fiction', 'Fantasy', 'Romance', 'Mystery', 'Thriller', 'Science', 'Technology', 'Programming', 'Java', 'Python', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Artificial Intelligence', 'Machine Learning', 'Data Science', 'History', 'Biography', 'Business', 'Finance', 'Self Help', 'Psychology', 'Health', 'Children', 'Philosophy', 'Education'
];
const MIN_RESULTS_BEFORE_FALLBACK = 8;

const LOG_FILE = path.join(__dirname, '..', 'import-dryrun.log');
const PREVIEW_FILE = path.join(__dirname, '..', 'import-preview.json');

const log = (message) => {
    const timestamp = new Date().toISOString();
    const fullMessage = `[${timestamp}] ${message}`;
    fs.appendFileSync(LOG_FILE, fullMessage + '\n');
    console.log(fullMessage);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runDryRun = async () => {
    const startedAt = Date.now();
    log('=== DRY RUN MODE ===');
    log('Fetching book metadata WITHOUT writing to database...');
    log('');

    const results = [];
    const allBooks = [];

    for (const category of CATEGORIES) {
        log(`[${category}] Fetching...`);
        
        try {
            const googleResult = await fetchGoogleBooksByCategory(category, { maxPages: 1, pageSize: 20 });
            log(`[${category}] Google Books: ${googleResult.books.length} books`);

            let booksToImport = googleResult.books;
            if (!googleResult.books.length || googleResult.books.length < MIN_RESULTS_BEFORE_FALLBACK) {
                const fallbackResult = await fetchOpenLibraryBooksByCategory(category);
                log(`[${category}] Open Library: ${fallbackResult.books.length} books`);
                booksToImport = [...googleResult.books, ...fallbackResult.books];
            }

            results.push({
                category,
                count: booksToImport.length,
                source: booksToImport.some(b => b.source === 'google') ? 'google' : 'open-library',
            });

            for (const book of booksToImport.slice(0, 3)) {
                allBooks.push({
                    title: book.title,
                    author: book.authors?.[0] || 'Unknown',
                    category,
                    price: book.price || 299,
                    source: book.source,
                });
            }

            await sleep(800);
        } catch (error) {
            log(`[${category}] ERROR: ${error.message}`);
        }
    }

    const totalBooks = results.reduce((sum, r) => sum + r.count, 0);
    const durationMs = Date.now() - startedAt;

    log('');
    log('=== DRY RUN SUMMARY ===');
    log(`Total categories queried: ${CATEGORIES.length}`);
    log(`Total books found: ${totalBooks}`);
    log(`Duration: ${(durationMs / 1000).toFixed(1)}s`);
    log('');
    log('Preview file: import-preview.json');
    log('');
    log('To import these books into MongoDB, ensure MongoDB is running and execute:');
    log('  npm run import-books');


    fs.writeFileSync(PREVIEW_FILE, JSON.stringify({ categories: results, sampleBooks: allBooks }, null, 2));
    log(`✓ Preview written to ${PREVIEW_FILE}`);
};

runDryRun().catch((error) => {
    console.error('Dry-run failed:', error);
    process.exitCode = 1;
});
