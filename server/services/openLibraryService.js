const { normalizeOpenLibraryBook } = require('../utils/bookNormalizer');

const OPEN_LIBRARY_ENDPOINT = 'https://openlibrary.org/search.json';
const DEFAULT_LIMIT = 20;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchOpenLibraryBooksByCategory = async (categoryName, options = {}) => {
    const books = [];
    let errors = 0;

    try {
        const url = new URL(OPEN_LIBRARY_ENDPOINT);
        url.searchParams.set('q', `subject:${categoryName}`);
        url.searchParams.set('limit', String(options.limit || DEFAULT_LIMIT));
        url.searchParams.set('fields', 'key,title,subtitle,author_name,description,subject,publisher,first_publish_year,number_of_pages_median,language,cover_i,ratings_average,ratings_count,isbn');

        const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`Open Library responded with ${response.status}`);

        const payload = await response.json();
        const docs = Array.isArray(payload.docs) ? payload.docs : [];
        for (const item of docs) {
            const normalized = normalizeOpenLibraryBook(item, categoryName);
            if (normalized.title) books.push(normalized);
        }
    } catch (error) {
        errors += 1;
        console.warn(`[open-library] ${categoryName} failed: ${error.message}`);
    }

    if (books.length) {
        await sleep(options.delayMs || 700);
    }

    return { books, errors, source: 'open-library' };
};

module.exports = { fetchOpenLibraryBooksByCategory };
