const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Book = require('../models/Book');
const Author = require('../models/Author');
const Publisher = require('../models/Publisher');
const Category = require('../models/Category');
const Review = require('../models/Review');

const SILHOUETTES = [
    '/uploads/author-silhouettes/silhouette-1.svg',
    '/uploads/author-silhouettes/silhouette-2.svg',
    '/uploads/author-silhouettes/silhouette-3.svg',
    '/uploads/author-silhouettes/silhouette-4.svg',
];

const CATEGORY_ICONS = {
    Fiction: '📚',
    Fantasy: '🧙',
    Romance: '❤️',
    Mystery: '🕵️',
    Thriller: '🔪',
    Science: '🔬',
    Technology: '💻',
    Programming: '🧑‍💻',
    Java: '☕',
    Python: '🐍',
    JavaScript: '✨',
    React: '⚛️',
    'Node.js': '🟢',
    MongoDB: '🍃',
    'Artificial Intelligence': '🤖',
    'Machine Learning': '🧠',
    'Data Science': '📊',
    History: '🏛️',
    Biography: '👤',
    Business: '💼',
    Finance: '💰',
    'Self Help': '🧘',
    Psychology: '🧠',
    Health: '❤️',
    Children: '🧒',
    Philosophy: '🤔',
    Education: '🎓',
};

const fetchJson = async (url) => {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        const res = await fetch(url, {
            headers: { 'User-Agent': 'BookstoreMetadataBot/1.0' },
            signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.warn('[fetchJson] failed', url, error.name === 'AbortError' ? 'timeout' : error.message);
        return null;
    }
};

const cleanName = (value) => {
    if (!value) return '';
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 ]+/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
};

const authorMatchKey = (name) => {
    const normalized = cleanName(name);
    const tokens = normalized.split(' ').filter(Boolean);
    if (!tokens.length) return normalized;
    const last = tokens[tokens.length - 1];
    const first = tokens[0]?.charAt(0) || '';
    return `${last}|${first}`;
};

const isSameAuthorName = (left, right) => {
    if (!left || !right) return false;
    const la = cleanName(left);
    const ra = cleanName(right);
    if (la === ra) return true;
    if (authorMatchKey(left) === authorMatchKey(right)) return true;
    if (la.includes(ra) || ra.includes(la)) return true;
    return false;
};

const clusterAuthorNames = (names) => {
    const groups = [];
    for (const name of names) {
        const existing = groups.find((group) => group.names.some((item) => isSameAuthorName(item, name)));
        if (existing) {
            existing.names.push(name);
            existing.count += 1;
        } else {
            groups.push({ names: [name], count: 1 });
        }
    }
    return groups.map((group) => {
        const frequency = {};
        group.names.forEach((name) => { frequency[name] = (frequency[name] || 0) + 1; });
        const canonical = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0][0];
        return { canonical, names: Array.from(new Set(group.names)), count: group.count };
    });
};

const pickSilhouette = (seed) => {
    const index = Math.abs(seed.split('').reduce((sum, chr) => sum + chr.charCodeAt(0), 0)) % SILHOUETTES.length;
    return SILHOUETTES[index];
};

const ensureWord = (value) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);

const searchWikipediaPage = async (name) => {
    const query = encodeURIComponent(name);
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages|info&exintro=1&explaintext=1&piprop=original&pithumbsize=640&redirects=1&titles=${query}`;
    const data = await fetchJson(url);
    if (!data?.query?.pages) return null;
    const page = Object.values(data.query.pages)[0];
    if (!page || page.missing) return null;
    return {
        title: page.title,
        summary: page.extract || '',
        wikipediaUrl: page.fullurl,
        photoUrl: page.original?.source || page.thumbnail?.source || null,
        pageId: page.pageid,
    };
};

const searchPublisherWikipedia = async (name) => {
    return await searchWikipediaPage(name);
};

const searchOpenLibraryAuthor = async (name) => {
    const query = encodeURIComponent(name);
    const url = `https://openlibrary.org/search/authors.json?q=${query}`;
    const data = await fetchJson(url);
    if (!data?.docs?.length) return null;
    const candidate = data.docs[0];
    return {
        openLibraryId: candidate.key?.split('/').pop(),
        workCount: candidate.work_count || 0,
        topWork: candidate.top_work || undefined,
        name: candidate.name,
    };
};

const fetchOpenLibraryAuthorDetails = async (openLibraryId) => {
    if (!openLibraryId) return null;
    const url = `https://openlibrary.org/authors/${openLibraryId}.json`;
    const data = await fetchJson(url);
    if (!data) return null;
    const bio = typeof data.bio === 'string' ? data.bio : data.bio?.value;
    const birthDate = data.birth_date;
    const deathDate = data.death_date;
    const wikipediaLink = Array.isArray(data.links)
        ? data.links.find((link) => link.title?.toLowerCase().includes('wikipedia'))?.url
        : undefined;
    return { bio, birthDate, deathDate, wikipediaLink };
};

const guessNationality = (summary) => {
    const nationalityWords = ['American', 'British', 'Canadian', 'Australian', 'Indian', 'French', 'German', 'Brazilian', 'Israeli', 'Japanese', 'Italian', 'Spanish'];
    if (!summary) return undefined;
    for (const word of nationalityWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(summary)) return word;
    }
    return undefined;
};

const guessOccupations = (summary) => {
    if (!summary) return [];
    const occupations = ['novelist', 'writer', 'poet', 'journalist', 'essayist', 'playwright', 'biographer', 'historian', 'scientist', 'philosopher'];
    return occupations.filter((occupation) => new RegExp(`\\b${occupation}\\b`, 'i').test(summary)).slice(0, 3);
};

const generateFollowers = (bookCount, averageRating) => {
    const base = Math.max(10, bookCount) * (averageRating || 3.2) * 300;
    const estimate = Math.round(base + Math.random() * base * 0.25);
    return estimate;
};

const buildBookMaps = (books) => {
    const booksByAuthor = {};
    const booksByPublisher = {};
    const booksByCategory = {};

    for (const book of books) {
        for (const author of book.authors || []) {
            const name = author?.trim();
            if (!name) continue;
            booksByAuthor[name] = booksByAuthor[name] || [];
            booksByAuthor[name].push(book);
        }
        const publisherName = (book.publisherName || book.publisher || '').trim();
        if (publisherName) {
            booksByPublisher[publisherName] = booksByPublisher[publisherName] || [];
            booksByPublisher[publisherName].push(book);
        }
        for (const category of book.categories || []) {
            const name = category?.trim();
            if (!name) continue;
            booksByCategory[name] = booksByCategory[name] || [];
            booksByCategory[name].push(book);
        }
    }

    return { booksByAuthor, booksByPublisher, booksByCategory };
};

const buildAuthorDocs = async (bookAuthors, booksByAuthor) => {
    const authorNames = Array.from(new Set(bookAuthors.filter(Boolean).map((name) => name.trim())));
    const clusters = clusterAuthorNames(authorNames);
    const authorDocs = [];

    for (const cluster of clusters) {
        const names = cluster.names;
        const canonicalName = cluster.canonical;
        const booksForAuthor = names.flatMap((name) => booksByAuthor[name] || []);
        const categories = Array.from(new Set(booksForAuthor.flatMap((book) => book.categories || []).filter(Boolean)));
        const languages = Array.from(new Set(booksForAuthor.map((book) => book.language).filter(Boolean)));
        const totalBooks = booksForAuthor.length;
        const averageRating = booksForAuthor.length
            ? Math.round((booksForAuthor.reduce((sum, book) => sum + (book.averageRating || 0), 0) / booksForAuthor.length) * 10) / 10
            : 0;

        const summary = categories.length
            ? `Author ${canonicalName} is known for ${totalBooks} book${totalBooks === 1 ? '' : 's'} covering ${categories.slice(0, 3).join(', ')}.`
            : `Author ${canonicalName} has ${totalBooks} book${totalBooks === 1 ? '' : 's'} in the catalog.`;
        const followers = generateFollowers(totalBooks, averageRating);

        const authorData = {
            name: canonicalName,
            slug: canonicalName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            biography: summary,
            photoUrl: pickSilhouette(canonicalName),
            nationality: undefined,
            birthDate: undefined,
            deathDate: undefined,
            genres: categories,
            occupation: categories.length ? categories.slice(0, 2).map((name) => `${name} Author`) : ['Author'],
            officialWebsite: undefined,
            wikipediaUrl: undefined,
            openLibraryId: undefined,
            awards: [],
            languages,
            isVerified: false,
            isFeatured: totalBooks > 3 || averageRating >= 4.2,
            totalBooks,
            averageRating,
            followers,
            followersEstimated: true,
            bookCount: totalBooks,
        };

        const existing = await Author.findOne({ slug: authorData.slug });
        if (existing) {
            authorDocs.push(existing);
            continue;
        }

        const author = await Author.create(authorData);
        authorDocs.push(author);
    }

    return authorDocs;
};

const buildPublisherDocs = async (bookPublishers, booksByPublisher) => {
    const publisherNames = Array.from(new Set(bookPublishers.filter(Boolean).map((name) => name.trim())));
    const publisherDocs = [];

    for (const publisherName of publisherNames) {
        const booksForPublisher = booksByPublisher[publisherName] || [];
        const totalPublishedBooks = booksForPublisher.length;
        const publisherData = {
            name: publisherName,
            slug: publisherName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            logoUrl: null,
            country: undefined,
            website: undefined,
            description: `Publisher ${publisherName} is responsible for ${totalPublishedBooks} book${totalPublishedBooks === 1 ? '' : 's'} in the catalog.`,
            totalPublishedBooks,
            bookCount: totalPublishedBooks,
        };

        const existing = await Publisher.findOne({ slug: publisherData.slug });
        if (existing) {
            publisherDocs.push(existing);
            continue;
        }

        const publisher = await Publisher.create(publisherData);
        publisherDocs.push(publisher);
    }

    return publisherDocs;
};

const buildCategoryDocs = async (bookCategories, authorDocs, booksByCategory) => {
    const categoryNames = Array.from(new Set(bookCategories.filter(Boolean).map((name) => name.trim())));
    const categoryDocs = [];

    for (const categoryName of categoryNames) {
        const booksForCategory = booksByCategory[categoryName] || [];
        if (!booksForCategory.length) continue;
        const topBooks = booksForCategory.slice(0, 4).map((book) => book.title);
        const topAuthors = {};
        for (const book of booksForCategory) {
            for (const authorName of book.authors || []) {
                topAuthors[authorName] = (topAuthors[authorName] || 0) + 1;
            }
        }
        const popularAuthorNames = Object.entries(topAuthors)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name]) => name);
        const popularAuthors = authorDocs
            .filter((author) => popularAuthorNames.some((name) => isSameAuthorName(name, author.name)))
            .slice(0, 3)
            .map((author) => author._id);
        const recentBooks = booksForCategory.filter((book) => book.publicationDate && new Date(book.publicationDate) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 5));
        const averageRating = booksForCategory.length
            ? booksForCategory.reduce((sum, book) => sum + (book.averageRating || 0), 0) / booksForCategory.length
            : 0;
        const categoryData = {
            name: categoryName,
            slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            description: `Books in ${categoryName}: ${topBooks.slice(0, 3).join(', ')}${topBooks.length > 3 ? ', and more' : ''}.`,
            icon: CATEGORY_ICONS[categoryName] || '📘',
            bannerImage: booksForCategory[0]?.coverImage || '/uploads/author-silhouettes/silhouette-1.svg',
            popularAuthors,
            totalBooks: booksForCategory.length,
            bookCount: booksForCategory.length,
            isFeatured: booksForCategory.length >= 6,
            isTrending: recentBooks.length >= Math.max(2, Math.round(booksForCategory.length * 0.15)) || averageRating >= 4.3,
            isActive: true,
        };

        const existing = await Category.findOne({ slug: categoryData.slug });
        if (existing) {
            categoryDocs.push(existing);
            continue;
        }

        const category = await Category.create(categoryData);
        categoryDocs.push(category);
    }

    return categoryDocs;
};

const reviewSubjects = [
    'engaging', 'thought-provoking', 'well-paced', 'beautifully written',
    'hard to put down', 'confusing at times', 'truly immersive', 'average', 'disappointing',
    'unexpectedly charming', 'powerful', 'inspiring', 'a bit slow', 'excellent', 'too predictable',
];

const generateReviewComment = (book, rating) => {
    const genre = (book.categories || [])[0] || 'book';
    const descriptors = rating >= 4 ? ['captivating', 'well-crafted', 'compelling', 'beautiful'] : ['uneven', 'predictable', 'challenging', 'slow'];
    const tone = descriptors[Math.floor(Math.random() * descriptors.length)];
    const base = book.description || '';
    const short = base.split('.').slice(0, 2).join('.');
    if (rating >= 4) {
        return `This ${genre.toLowerCase()} was ${tone} and stayed with me long after reading. ${short ? `${short}.` : ''} I recommended it to friends.`;
    }
    return `I found this ${genre.toLowerCase()} a bit ${tone}. ${short ? `${short}.` : ''} It has moments, but it didn't fully work for me.`;
};

const generateReviewTitle = (rating) => {
    if (rating === 5) return 'Absolutely loved it';
    if (rating === 4) return 'Really enjoyed this one';
    if (rating === 3) return 'A decent read';
    if (rating === 2) return 'Not what I expected';
    return 'Was disappointed';
};

const randomDateWithinMonths = (months) => {
    const now = Date.now();
    const past = now - Math.round(Math.random() * months * 30 * 24 * 60 * 60 * 1000);
    return new Date(past);
};

const createReviews = async () => {
    const books = await Book.find().lean();
    console.log(`Creating review documents for ${books.length} books...`);
    if (!books.length) return;
    await Review.deleteMany({});

    const reviewerNames = [
        'Mira Patel', 'Daniel Reed', 'Aditi Sharma', 'Noah Brooks', 'Sara Kim',
        'Priya Nair', 'Luis Alvarez', 'Emma Clarke', 'Arjun Singh', 'Leila Hassan',
    ];

    for (let bookIndex = 0; bookIndex < books.length; bookIndex += 1) {
        const book = books[bookIndex];
        if (bookIndex % 50 === 0) {
            console.log(`Generating reviews for book ${bookIndex + 1}/${books.length}: ${book.title}`);
        }
        const count = Math.min(15, Math.max(3, Math.round((book.ratingsCount || 5) / 4) + Math.floor(Math.random() * 3)));
        const reviews = [];
        for (let i = 0; i < count; i += 1) {
            const rating = Math.max(1, Math.min(5, Math.round((book.averageRating || 4) + (Math.random() - 0.45) * 1.5)));
            const name = reviewerNames[(i + book.title.length) % reviewerNames.length];
            const comment = generateReviewComment(book, rating);
            reviews.push({
                book: book._id,
                user: new mongoose.Types.ObjectId(),
                userName: name,
                avatarUrl: `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(name)}`,
                rating,
                title: generateReviewTitle(rating),
                comment,
                isVerifiedPurchase: Math.random() < 0.7,
                helpfulCount: Math.round(Math.max(0, (rating - 2) * Math.random() * 12)),
                createdAt: randomDateWithinMonths(18),
                isApproved: true,
                isActive: true,
            });
        }
        try {
            await Review.insertMany(reviews, { ordered: false });
        } catch (error) {
            console.error(`Failed to insert reviews for book ${book.title}:`, error.message || error);
        }
    }
};

const run = async () => {
    await connectDB();
    console.log('Connected to MongoDB for metadata population');

    const books = await Book.find().lean();
    const bookAuthors = books.flatMap((book) => book.authors || []);
    const bookPublishers = books.map((book) => book.publisherName || book.publisher).filter(Boolean);
    const bookCategories = books.flatMap((book) => book.categories || []);

    console.log('Clearing existing authors, publishers, categories, and reviews...');
    await Promise.all([Author.deleteMany(), Publisher.deleteMany(), Category.deleteMany(), Review.deleteMany()]);

    const { booksByAuthor, booksByPublisher, booksByCategory } = buildBookMaps(books);

    console.log('Building author documents...');
    const authorDocs = await buildAuthorDocs(bookAuthors, booksByAuthor);
    console.log(`Created ${authorDocs.length} author documents.`);

    console.log('Building publisher documents...');
    const publisherDocs = await buildPublisherDocs(bookPublishers, booksByPublisher);
    console.log(`Created ${publisherDocs.length} publisher documents.`);

    console.log('Building category documents...');
    const categoryDocs = await buildCategoryDocs(bookCategories, authorDocs, booksByCategory);
    console.log(`Created ${categoryDocs.length} category documents.`);

    console.log('Creating review documents...');
    await createReviews();
    const reviewCount = await Review.countDocuments();
    console.log(`Created ${reviewCount} review documents.`);

    console.log('Population complete.');
    await mongoose.disconnect();
};

run().catch((error) => {
    console.error('Metadata population failed:', error);
    process.exit(1);
});
