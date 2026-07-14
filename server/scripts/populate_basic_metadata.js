const mongoose = require('mongoose');
const Book = require('../models/Book');
const Author = require('../models/Author');
const Publisher = require('../models/Publisher');
const Category = require('../models/Category');
const Review = require('../models/Review');
const dbConnect = require('../config/db');

function normalizeName(n) {
  return (n || '').toLowerCase().replace(/[\.\s]+/g, ' ').trim();
}

async function upsertAuthor(name, bookId, book) {
  const norm = normalizeName(name);
  if (!norm) return null;
  // try to find existing by normalized name
  let doc = await Author.findOne({ name: new RegExp('^' + name.replace(/[-\\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') });
  if (!doc) {
    doc = await Author.findOne({ slug: norm.replace(/\s+/g, '-') });
  }
  if (!doc) {
    doc = new Author({ name, slug: norm.replace(/\s+/g, '-') });
  }
  // add book ref
  if (bookId && !doc.books.map(String).includes(String(bookId))) doc.books.push(bookId);
  // aggregate stats
  doc.totalBooks = doc.books.length;
  const ratings = (await Book.find({ _id: { $in: doc.books } })).map(b => b.averageRating || 0);
  doc.averageRating = ratings.length ? Math.round((ratings.reduce((a,c)=>a+c,0)/ratings.length)*100)/100 : 0;
  // derive followers estimate
  doc.followers = Math.max(10, Math.round(doc.totalBooks * (doc.averageRating || 3) * 42));
  doc.isEstimatedFollowers = true;
  // collect genres/languages
  const genres = new Set(doc.genres || []);
  const langs = new Set(doc.languages || []);
  if (book) {
    (book.tags || []).forEach(t => genres.add(t));
    if (book.language) langs.add(book.language);
  }
  doc.genres = Array.from(genres).slice(0, 12);
  doc.languages = Array.from(langs).slice(0,6);
  await doc.save();
  return doc;
}

async function upsertPublisher(name, bookId, book) {
  if (!name) return null;
  let doc = await Publisher.findOne({ name: new RegExp('^' + name.replace(/[-\\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') });
  if (!doc) {
    doc = new Publisher({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') });
  }
  if (bookId && !doc.books.map(String).includes(String(bookId))) doc.books.push(bookId);
  doc.totalPublishedBooks = doc.books.length;
  await doc.save();
  return doc;
}

async function upsertCategory(name, bookId, book) {
  if (!name) return null;
  let doc = await Category.findOne({ name: new RegExp('^' + name.replace(/[-\\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') });
  if (!doc) {
    doc = new Category({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') });
  }
  if (bookId && !doc.books.map(String).includes(String(bookId))) doc.books.push(bookId);
  doc.totalBooks = doc.books.length;
  await doc.save();
  return doc;
}

async function generateReviewsForBook(book) {
  // scale by existing totalReviews or ratingsCount
  const target = Math.min(12, Math.max(0, Math.round((book.totalReviews || 0) / 5)));
  const examples = [];
  if (!target) return [];
  const baseText = (book.shortDescription || book.description || '').slice(0, 220);
  for (let i = 0; i < target; i++) {
    const rating = Math.max(1, Math.min(5, Math.round((book.averageRating || 3) + (Math.random() - 0.4) * 1.8)));
    const userName = `Reader${Math.floor(1000 + Math.random() * 9000)}`;
    const title = rating >= 4 ? 'Really enjoyed this one' : (rating === 3 ? 'Mixed feelings' : 'Not for me');
    const text = `${baseText ? baseText + ' ' : ''}${rating >=4 ? 'A strong read for fans of the genre.' : 'Had some issues with pacing and character development.'}`;
    examples.push({ bookId: book._id, userName, avatarUrl: null, rating, title, text, isVerifiedPurchase: Math.random() < 0.4, helpfulCount: Math.floor(Math.random()*12), createdAt: new Date(Date.now() - Math.floor(Math.random()*1000*60*60*24*365)) });
  }
  return examples;
}

const fs = require('fs');
const logFile = 'server/import.log';
function slog(...args) {
  try { fs.appendFileSync(logFile, new Date().toISOString() + ' ' + args.join(' ') + '\n'); } catch (e) {}
  console.log(...args);
}

async function main() {
  await dbConnect();
  slog('Connected to DB, scanning books...');
  const cursor = Book.find({}).cursor();
  let count = 0;
  for (let book = await cursor.next(); book != null; book = await cursor.next()) {
    count++;
    // authors array of strings on book
    const bookId = book._id;
    const bookDoc = book;
    const authors = book.authors && book.authors.length ? book.authors : (book.authorName ? [book.authorName] : []);
    for (const a of (authors || [])) {
      await upsertAuthor(a, bookId, bookDoc);
    }
    await upsertPublisher(book.publisherName || book.publisher, bookId, bookDoc);
    for (const c of (book.categories || [])) {
      await upsertCategory(c, bookId, bookDoc);
    }
    // create lightweight reviews
    const revs = await generateReviewsForBook(bookDoc);
    for (const r of revs) {
      await Review.create(r).catch(()=>{});
    }
    if (count % 200 === 0) slog('Processed', count, 'books');
  }
  slog('Finished scanning', count, 'books');
  // populate popularAuthors for categories (top authors by book count)
  const categories = await Category.find({});
  for (const cat of categories) {
    const books = await Book.find({ _id: { $in: cat.books } });
    const authorCounts = {};
    for (const b of books) {
      (b.authors || []).forEach(a => { authorCounts[a] = (authorCounts[a] || 0) + 1; });
    }
    const top = Object.keys(authorCounts).slice(0,5);
    const authorDocs = [];
    for (const name of top) {
      const a = await Author.findOne({ name: new RegExp('^' + name.replace(/[-\\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') });
      if (a) authorDocs.push(a._id);
    }
    cat.popularAuthors = authorDocs;
    await cat.save();
  }

  slog('Metadata population complete.');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
