const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');
const util = require('util');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const Book = require('../models/Book');
const Author = require('../models/Author');
const Category = require('../models/Category');
const Publisher = require('../models/Publisher');
const { fetchGoogleBooksByCategory } = require('../services/googleBooksService');
const { fetchOpenLibraryBooksByCategory } = require('../services/openLibraryService');

const LOG_FILE = path.join(__dirname, '..', 'import.log');
const originalLog = console.log;
const originalError = console.error;

const log = (message) => {
    const timestamp = new Date().toISOString();
    const fullMessage = `[${timestamp}] ${message}`;
    fs.appendFileSync(LOG_FILE, fullMessage + '\n');
    originalLog(fullMessage);
};

const logError = (message) => {
    const timestamp = new Date().toISOString();
    const fullMessage = `[${timestamp}] ERROR: ${message}`;
    fs.appendFileSync(LOG_FILE, fullMessage + '\n');
    originalError(fullMessage);
};

console.log = log;
console.error = logError;

log('Import script started');
log('MONGO_URI: ' + (process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 50) + '...' : 'NOT SET'));

const CATEGORIES = [
    'Fiction', 'Fantasy', 'Romance', 'Mystery', 'Thriller', 'Science', 'Technology', 'Programming', 'Java', 'Python', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Artificial Intelligence', 'Machine Learning', 'Data Science', 'History', 'Biography', 'Business', 'Finance', 'Self Help', 'Psychology', 'Health', 'Children', 'Philosophy', 'Education'
];
const MIN_RESULTS_BEFORE_FALLBACK = 8;
const BATCH_SIZE = 50;

const slugify = (value = '') => String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'book';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ensureCategory = async (name) => {
    const normalizedName = String(name || '').trim();
    if (!normalizedName) return null;

    let category = await Category.findOne({ name: normalizedName });
    if (!category) {
        category = await Category.create({
            name: normalizedName,
            description: `${normalizedName} curated books`,
            isFeatured: false,
            isActive: true,
        });
    }
    return category;
};

const AUTHOR_PROFILES = {
    'J.K. Rowling': {
        biography: 'British author best known for the Harry Potter fantasy series.',
        country: 'United Kingdom',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
        socialLinks: { website: 'https://www.jkrowling.com', twitter: 'https://twitter.com/jk_rowling' },
    },
    'George Orwell': {
        biography: 'English novelist and critic famous for Animal Farm and 1984.',
        country: 'United Kingdom',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        socialLinks: { website: 'https://www.orwellfoundation.com' },
    },
    'Stephen Hawking': {
        biography: 'Theoretical physicist and author known for A Brief History of Time.',
        country: 'United Kingdom',
        photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
    },
    'Yuval Noah Harari': {
        biography: 'Israeli historian and author of Sapiens and Homo Deus.',
        country: 'Israel',
        photo: 'https://images.unsplash.com/photo-1548449112-96a38a643324?w=200',
        socialLinks: { website: 'https://www.ynharari.com' },
    },
    'Paulo Coelho': {
        biography: 'Brazilian bestselling novelist best known for The Alchemist.',
        country: 'Brazil',
        photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
        socialLinks: { website: 'https://paulocoelho.com' },
    },
    'Dale Carnegie': {
        biography: 'Author and lecturer famous for How to Win Friends & Influence People.',
        country: 'United States',
        photo: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=200',
    },
    'Michelle Obama': {
        biography: 'American attorney and author who served as First Lady of the United States.',
        country: 'United States',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
    },
    'Agatha Christie': {
        biography: 'English writer known for her 66 detective novels and 14 short story collections, particularly featuring Hercule Poirot.',
        country: 'United Kingdom',
        photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200',
    },
    'Jane Austen': {
        biography: 'English novelist known for her six major novels, including Pride and Prejudice and Sense and Sensibility.',
        country: 'United Kingdom',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    },
    'Mark Manson': {
        biography: 'American self-help author known for The Subtle Art of Not Giving a F*ck and writings on modern life.',
        country: 'United States',
        photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
    },
    'Malcolm Gladwell': {
        biography: 'Canadian journalist and author known for his books on sociology and behavioral psychology.',
        country: 'Canada',
        photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200',
    },
};

const getAuthorProfile = (name) => {
    const normalizedName = String(name || '').trim();
    return AUTHOR_PROFILES[normalizedName] || null;
};

const ensureAuthor = async (name) => {
    const normalizedName = String(name || '').trim();
    if (!normalizedName) return null;

    const authorSlug = slugify(normalizedName);
    let author = await Author.findOne({ $or: [{ slug: authorSlug }, { name: normalizedName }] });
    const profile = getAuthorProfile(normalizedName);

    if (author) {
        const updates = {};
        if (profile) {
            if (!author.biography) updates.biography = profile.biography;
            if (!author.photo) updates.photo = profile.photo;
            if (!author.country) updates.country = profile.country;
            if (!author.socialLinks || Object.keys(author.socialLinks || {}).length === 0) updates.socialLinks = profile.socialLinks;
        }
        if (Object.keys(updates).length) {
            author = await Author.findByIdAndUpdate(author._id, updates, { new: true, runValidators: true });
        }
        return author;
    }

    const baseAuthor = {
        name: normalizedName,
        slug: authorSlug,
        biography: profile?.biography || `${normalizedName} is featured in the imported catalog.`,
        photo: profile?.photo || `https://i.pravatar.cc/300?u=${authorSlug}`,
        country: profile?.country || 'Unknown',
        socialLinks: profile?.socialLinks || {},
        awards: profile?.awards || [],
        isActive: true,
    };

    try {
        author = await Author.create(baseAuthor);
        return author;
    } catch (error) {
        if (error.code === 11000) {
            return await Author.findOne({ slug: authorSlug }) || await Author.findOne({ name: normalizedName });
        }
        throw error;
    }
};

const ensurePublisher = async (name) => {
    const normalizedName = String(name || '').trim();
    if (!normalizedName) return null;

    const publisherSlug = slugify(normalizedName);
    let publisher = await Publisher.findOne({ $or: [{ slug: publisherSlug }, { name: normalizedName }] });
    if (publisher) return publisher;

    try {
        publisher = await Publisher.create({
            name: normalizedName,
            slug: publisherSlug,
            description: `${normalizedName} contributed books to the imported catalog.`,
            isActive: true,
        });
        return publisher;
    } catch (error) {
        if (error.code === 11000) {
            return await Publisher.findOne({ slug: publisherSlug }) || await Publisher.findOne({ name: normalizedName });
        }
        throw error;
    }
};

const mapTextLanguage = (language) => {
    const normalized = String(language || '').trim().toLowerCase();
    const languageMap = {
        en: 'english',
        eng: 'english',
        english: 'english',
        fr: 'french',
        fre: 'french',
        french: 'french',
        es: 'spanish',
        spa: 'spanish',
        spanish: 'spanish',
        de: 'german',
        ger: 'german',
        deu: 'german',
        german: 'german',
        it: 'italian',
        ita: 'italian',
        italian: 'italian',
        pt: 'portuguese',
        por: 'portuguese',
        portuguese: 'portuguese',
        ru: 'russian',
        rus: 'russian',
        russian: 'russian',
        zh: 'simplified_chinese',
        chi: 'simplified_chinese',
        chinese: 'simplified_chinese',
        ja: 'japanese',
        jpn: 'japanese',
        japanese: 'japanese',
        ko: 'korean',
        kor: 'korean',
        korean: 'korean',
        ar: 'arabic',
        arb: 'arabic',
        arabic: 'arabic',
        he: 'hebrew',
        heb: 'hebrew',
        hebrew: 'hebrew',
        hi: 'hindi',
        hin: 'hindi',
        hindi: 'hindi',
        pl: 'english',
        pol: 'english',
        hu: 'english',
        hun: 'english',
    };
    return languageMap[normalized] || 'english';
};

const ensureValidBookTextIndex = async () => {
    const indexes = await Book.collection.indexes();
    const textIndex = indexes.find((index) => {
        return index.weights
            && index.weights.title === 1
            && index.weights.description === 1
            && index.weights.tags === 1;
    });

    if (textIndex && textIndex.language_override) {
        console.log(`[import] Dropping legacy text index ${textIndex.name} with invalid language_override=${textIndex.language_override}`);
        await Book.collection.dropIndex(textIndex.name);
    }

    const cleanupFields = ['googleBookId', 'isbn10', 'isbn13', 'isbn'];
    for (const field of cleanupFields) {
        const filter = { [field]: '' };
        const result = await Book.updateMany(filter, { $unset: { [field]: '' } });
        if (result.modifiedCount) {
            console.log(`[import] Cleared empty ${field} from ${result.modifiedCount} book documents`);
        }
    }

    await Book.syncIndexes();
};

const ensureUniqueSlug = async (title) => {
    const baseSlug = slugify(title);
    let candidate = baseSlug;
    let suffix = 2;

    while (await Book.exists({ slug: candidate })) {
        candidate = `${baseSlug}-${suffix}`;
        suffix += 1;
    }

    return candidate;
};

const buildBookDocument = async (rawBook, categoryName, source) => {
    const category = await ensureCategory(categoryName || rawBook.categories?.[0]);
    const authorNames = rawBook.authors?.length ? rawBook.authors : ['Unknown Author'];
    const authorDocs = [];
    for (const authorName of authorNames) {
        const author = await ensureAuthor(authorName);
        if (author) authorDocs.push(author._id);
    }

    const publisher = rawBook.publisher ? await ensurePublisher(rawBook.publisher) : null;
    const title = rawBook.title || 'Untitled Book';
    const slug = await ensureUniqueSlug(title);
    const normalizedLanguage = mapTextLanguage(rawBook.language || rawBook.languages || 'en');

    const bookData = {
        title,
        subtitle: rawBook.subtitle || '',
        slug,
        description: rawBook.description || 'No description provided.',
        shortDescription: rawBook.description ? String(rawBook.description).slice(0, 180) : 'Imported from external catalog.',
        author: authorDocs[0] || null,
        authors: authorNames,
        category: category?._id || null,
        categories: rawBook.categories || [categoryName].filter(Boolean),
        publisher: publisher?._id || null,
        publisherName: publisher?.name || rawBook.publisher || '',
        publicationDate: rawBook.publishedDate ? new Date(rawBook.publishedDate) : undefined,
        pages: rawBook.pageCount || 0,
        language: normalizedLanguage,
        price: Number(rawBook.price || 0),
        currency: rawBook.currency || 'INR',
        discountPercent: 0,
        finalPrice: Number(rawBook.price || 0),
        stockQuantity: Number(rawBook.stock || 0),
        coverImage: rawBook.thumbnail || rawBook.highResCoverImage || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
        highResCoverImage: rawBook.highResCoverImage || rawBook.thumbnail || '',
        averageRating: Number(rawBook.averageRating || 0),
        totalReviews: Number(rawBook.ratingsCount || 0),
        isFeatured: false,
        isTrending: false,
        isBestSeller: false,
        isNewArrival: true,
        isActive: true,
        format: 'Paperback',
        previewLink: rawBook.previewLink || '',
        infoLink: rawBook.infoLink || '',
        saleability: rawBook.saleability || 'NOT_FOR_SALE',
        country: rawBook.country || 'US',
        priceSource: rawBook.priceSource || 'generated',
        stockSource: rawBook.stockSource || 'generated',
        source,
        tags: [categoryName, ...(rawBook.categories || [])].filter(Boolean).slice(0, 8),
        textLang: mapTextLanguage(rawBook.language || rawBook.languages || 'en'),
    };

    if (rawBook.googleBookId) {
        bookData.googleBookId = rawBook.googleBookId;
    }
    if (rawBook.isbn10) {
        bookData.isbn10 = rawBook.isbn10;
    }
    if (rawBook.isbn13) {
        bookData.isbn13 = rawBook.isbn13;
    }
    if (rawBook.isbn13 || rawBook.isbn10) {
        bookData.isbn = rawBook.isbn13 || rawBook.isbn10;
    }

    if (!bookData.price) {
        bookData.price = 299;
        bookData.finalPrice = 299;
    }
    if (!bookData.stockQuantity) {
        bookData.stockQuantity = 25;
    }

    return bookData;
};

const getUpsertFilter = (bookDoc) => {
    const filters = [];
    if (bookDoc.googleBookId) filters.push({ googleBookId: bookDoc.googleBookId });
    if (bookDoc.isbn13) filters.push({ isbn13: bookDoc.isbn13 });
    if (bookDoc.isbn10) filters.push({ isbn10: bookDoc.isbn10 });
    return filters.length ? { $or: filters } : { slug: bookDoc.slug };
};

const importCategory = async (categoryName) => {
    const summary = {
        category: categoryName,
        fetched: 0,
        inserted: 0,
        skipped: 0,
        errors: 0,
        source: 'google',
    };

    try {
        const googleResult = await fetchGoogleBooksByCategory(categoryName, { maxPages: 2, pageSize: 40 });
        summary.fetched += googleResult.books.length;
        summary.errors += googleResult.errors;

        let booksToImport = googleResult.books;
        if (!googleResult.books.length || googleResult.books.length < MIN_RESULTS_BEFORE_FALLBACK) {
            const fallbackResult = await fetchOpenLibraryBooksByCategory(categoryName);
            summary.fetched += fallbackResult.books.length;
            summary.errors += fallbackResult.errors;
            booksToImport = [...googleResult.books, ...fallbackResult.books];
            summary.source = fallbackResult.books.length ? 'open-library' : 'google';
        } else {
            summary.source = 'google';
        }

        if (!booksToImport.length) {
            console.log(`[import] ${categoryName} -> no books returned`);
            return summary;
        }

        const uniqueBooks = [];
        const seenKeys = new Set();
        for (const rawBook of booksToImport) {
            const key = rawBook.googleBookId || rawBook.isbn13 || rawBook.isbn10 || rawBook.title;
            if (!key || seenKeys.has(key)) continue;
            seenKeys.add(key);
            uniqueBooks.push(rawBook);
        }

        for (let index = 0; index < uniqueBooks.length; index += BATCH_SIZE) {
            const batch = uniqueBooks.slice(index, index + BATCH_SIZE);
            const operations = [];
            for (const rawBook of batch) {
                const bookDoc = await buildBookDocument(rawBook, categoryName, summary.source);
                operations.push({
                    updateOne: {
                        filter: getUpsertFilter(bookDoc),
                        update: {
                            $set: bookDoc,
                        },
                        upsert: true,
                    },
                });
            }

            const result = await Book.bulkWrite(operations, { ordered: false });
            summary.inserted += result.upsertedCount || 0;
            summary.skipped += result.modifiedCount || 0;
        }

        console.log(`[import] ${categoryName} -> fetched=${summary.fetched} inserted=${summary.inserted} skipped=${summary.skipped} errors=${summary.errors} source=${summary.source}`);
        return summary;
    } catch (error) {
        summary.errors += 1;
        console.error(`[import] ${categoryName} failed: ${error.message}`);
        return summary;
    }
};

const runImport = async () => {
    const startedAt = Date.now();
    const connected = await connectDB();
    if (!connected) {
        throw new Error('MongoDB connection failed. Set MONGO_URI in the server environment before running the import.');
    }

    await ensureValidBookTextIndex();

    const results = [];
    for (const category of CATEGORIES) {
        await sleep(600);
        const result = await importCategory(category);
        results.push(result);
    }

    const totalFetched = results.reduce((sum, item) => sum + (item.fetched || 0), 0);
    const totalInserted = results.reduce((sum, item) => sum + (item.inserted || 0), 0);
    const totalSkipped = results.reduce((sum, item) => sum + (item.skipped || 0), 0);
    const totalErrors = results.reduce((sum, item) => sum + (item.errors || 0), 0);
    const sourceBreakdown = results.reduce((acc, item) => {
        acc[item.source] = (acc[item.source] || 0) + 1;
        return acc;
    }, {});

    console.log('\n=== Book Import Summary ===');
    console.log({ totalFetched, totalInserted, totalSkipped, totalErrors, sourceBreakdown, durationMs: Date.now() - startedAt });
    await mongoose.disconnect();
};

runImport().catch((error) => {
    console.error('Import failed:', error);
    process.exitCode = 1;
});
