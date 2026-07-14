const fallbackBooks = [
    {
        _id: 'fallback-book-1',
        title: 'The Midnight Library',
        slug: 'the-midnight-library',
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
        finalPrice: 18.99,
        originalPrice: 24.99,
        averageRating: 4.7,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true,
        isTrending: true,
        isActive: true,
        author: { name: 'Matt Haig', slug: 'matt-haig' },
        category: { name: 'Fiction', slug: 'fiction' },
        publisher: { name: 'Canongate', slug: 'canongate' },
        description: 'A warm and reflective novel about regret, possibility, and second chances.'
    },
    {
        _id: 'fallback-book-2',
        title: 'Atomic Habits',
        slug: 'atomic-habits',
        coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80',
        finalPrice: 16.5,
        originalPrice: 21.0,
        averageRating: 4.8,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        isTrending: true,
        isActive: true,
        author: { name: 'James Clear', slug: 'james-clear' },
        category: { name: 'Self-Help', slug: 'self-help' },
        publisher: { name: 'Avery', slug: 'avery' },
        description: 'A practical guide to building better habits with small, sustainable changes.'
    },
    {
        _id: 'fallback-book-3',
        title: 'Educated',
        slug: 'educated',
        coverImage: 'https://images.unsplash.com/photo-1495446815901-01c7f4b7e5b0?auto=format&fit=crop&w=900&q=80',
        finalPrice: 14.25,
        originalPrice: 19.0,
        averageRating: 4.6,
        isFeatured: false,
        isBestSeller: true,
        isNewArrival: true,
        isTrending: false,
        isActive: true,
        author: { name: 'Tara Westover', slug: 'tara-westover' },
        category: { name: 'Memoir', slug: 'memoir' },
        publisher: { name: 'Random House', slug: 'random-house' },
        description: 'A powerful memoir about resilience, education, and finding one’s voice.'
    }
];

const fallbackCategories = [
    { _id: 'fallback-category-1', name: 'Fiction', slug: 'fiction', isActive: true, bookCount: 1 },
    { _id: 'fallback-category-2', name: 'Self-Help', slug: 'self-help', isActive: true, bookCount: 1 },
    { _id: 'fallback-category-3', name: 'Memoir', slug: 'memoir', isActive: true, bookCount: 1 }
];

const fallbackBanners = [
    {
        _id: 'fallback-banner-1',
        title: 'Discover Your Next Favorite Read',
        subtitle: 'Curated stories, timeless classics, and fresh voices.',
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1600&q=80',
        position: 'hero',
        isActive: true,
        link: '/books'
    }
];

const fallbackAuthors = [
    { _id: 'fallback-author-1', name: 'Matt Haig', slug: 'matt-haig', isActive: true, bookCount: 1 },
    { _id: 'fallback-author-2', name: 'James Clear', slug: 'james-clear', isActive: true, bookCount: 1 },
    { _id: 'fallback-author-3', name: 'Tara Westover', slug: 'tara-westover', isActive: true, bookCount: 1 }
];

const isDbUnavailableError = (error) => {
    return Boolean(error && (
        error.name === 'MongooseError' ||
        error.name === 'MongoServerError' ||
        error.message?.includes('buffering timed out') ||
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('ENOTFOUND') ||
        error.message?.includes('EADDRINUSE') ||
        error.message?.includes('topology')
    ));
};

const getFallbackBooksResponse = ({ limit = 8, page = 1 } = {}) => ({
    success: true,
    data: fallbackBooks.slice(0, limit),
    pagination: { page, limit, total: fallbackBooks.length, pages: 1, hasMore: false }
});

const getFallbackBookResponse = () => ({
    success: true,
    data: { book: fallbackBooks[0], relatedBooks: [] }
});

const getFallbackCategoriesResponse = () => ({ success: true, data: fallbackCategories });
const getFallbackAuthorsResponse = () => ({ success: true, data: fallbackAuthors });
const getFallbackBannersResponse = () => ({ success: true, data: fallbackBanners });

module.exports = {
    fallbackBooks,
    fallbackCategories,
    fallbackAuthors,
    isDbUnavailableError,
    getFallbackBooksResponse,
    getFallbackBookResponse,
    getFallbackCategoriesResponse,
    getFallbackAuthorsResponse,
    getFallbackBannersResponse,
};
