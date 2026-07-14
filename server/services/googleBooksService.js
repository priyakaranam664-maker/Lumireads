const { normalizeGoogleBook } = require('../utils/bookNormalizer');

const GOOGLE_BOOKS_ENDPOINT = 'https://www.googleapis.com/books/v1/volumes';
const DEFAULT_MAX_PAGES = 2;
const DEFAULT_MAX_RESULTS = 40;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchGoogleBooksByCategory = async (categoryName, options = {}) => {
    const maxPages = options.maxPages || DEFAULT_MAX_PAGES;
    const pageSize = options.pageSize || DEFAULT_MAX_RESULTS;
    const books = [];
    let errors = 0;

    for (let page = 0; page < maxPages; page += 1) {
        try {
            const url = new URL(GOOGLE_BOOKS_ENDPOINT);
            url.searchParams.set('q', `subject:${categoryName}`);
            url.searchParams.set('maxResults', String(pageSize));
            url.searchParams.set('startIndex', String(page * pageSize));
            url.searchParams.set('langRestrict', 'en');
            if (process.env.GOOGLE_BOOKS_API_KEY) {
                url.searchParams.set('key', process.env.GOOGLE_BOOKS_API_KEY);
            }

            const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
            if (!response.ok) throw new Error(`Google Books responded with ${response.status}`);

            const payload = await response.json();
            const items = Array.isArray(payload.items) ? payload.items : [];
            if (!items.length) break;

            for (const item of items) {
                const normalized = normalizeGoogleBook(item, categoryName);
                if (normalized.title) books.push(normalized);
            }

            if (items.length < pageSize) break;
            await sleep(options.delayMs || 700);
        } catch (error) {
            errors += 1;
            console.warn(`[google-books] ${categoryName} page ${page + 1} failed: ${error.message}`);
            break;
        }
    }

    return { books, errors, source: 'google' };
};

module.exports = { fetchGoogleBooksByCategory };
