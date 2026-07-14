const { generatePriceAndStock } = require('./priceGenerator');

const normalizeStringArray = (value) => (Array.isArray(value) ? value.filter(Boolean).map((entry) => String(entry).trim()) : []);

const getIsbn = (industryIdentifiers = []) => {
    const result = industryIdentifiers.find((item) => item.type === 'ISBN_13') || industryIdentifiers.find((item) => item.type === 'ISBN_10');
    return result ? result.identifier : '';
};

const normalizeGoogleBook = (item, categoryName) => {
    const volume = item?.volumeInfo || {};
    const saleInfo = item?.saleInfo || {};
    const thumbnails = volume.imageLinks || {};
    const isbn = getIsbn(volume.industryIdentifiers || []);
    const pageCount = Number(volume.pageCount || 0);
    const priceData = saleInfo.listPrice?.amount != null || saleInfo.retailPrice?.amount != null
        ? {
            price: saleInfo.listPrice?.amount ?? saleInfo.retailPrice?.amount ?? 0,
            currency: saleInfo.listPrice?.currencyCode ?? saleInfo.retailPrice?.currencyCode ?? 'USD',
            priceSource: 'sourced',
            stockSource: 'generated',
        }
        : generatePriceAndStock({ pageCount, categoryName, source: 'google' });

    const stock = saleInfo.isEbook ? 50 : priceData.stock ?? 20;

    return {
        title: volume.title || 'Untitled Book',
        subtitle: volume.subtitle || '',
        authors: normalizeStringArray(volume.authors),
        description: volume.description || 'No description available.',
        categories: normalizeStringArray(volume.categories).length ? normalizeStringArray(volume.categories) : [categoryName].filter(Boolean),
        publisher: volume.publisher || '',
        publishedDate: volume.publishedDate || '',
        pageCount,
        language: volume.language || 'en',
        averageRating: Number(volume.averageRating || 0),
        ratingsCount: Number(volume.ratingsCount || 0),
        thumbnail: thumbnails.thumbnail || '',
        highResCoverImage: thumbnails.extraLarge || thumbnails.large || thumbnails.medium || thumbnails.thumbnail || '',
        previewLink: volume.previewLink || '',
        infoLink: volume.infoLink || '',
        saleability: saleInfo.saleability || 'NOT_FOR_SALE',
        country: saleInfo.country || 'US',
        price: priceData.price || 0,
        currency: priceData.currency || 'USD',
        stock,
        priceSource: priceData.priceSource || 'generated',
        stockSource: priceData.stockSource || 'generated',
        googleBookId: item?.id || '',
        isbn10: isbn && isbn.length === 10 ? isbn : '',
        isbn13: isbn && isbn.length === 13 ? isbn : '',
        source: 'google',
    };
};

const normalizeOpenLibraryBook = (item, categoryName) => {
    const priceData = generatePriceAndStock({ pageCount: Number(item.number_of_pages_median || 220), categoryName, source: 'open-library' });
    const authors = normalizeStringArray(item.author_name);
    const subjects = normalizeStringArray(item.subject);

    return {
        title: item.title || 'Untitled Book',
        subtitle: item.subtitle || '',
        authors,
        description: item.description || 'No description available.',
        categories: subjects.length ? subjects : [categoryName].filter(Boolean),
        publisher: Array.isArray(item.publisher) ? item.publisher[0] || '' : item.publisher || '',
        publishedDate: item.first_publish_year ? String(item.first_publish_year) : '',
        pageCount: Number(item.number_of_pages_median || 0),
        language: Array.isArray(item.language) ? item.language[0] || 'en' : item.language || 'en',
        averageRating: Number(item.ratings_average || 0),
        ratingsCount: Number(item.ratings_count || 0),
        thumbnail: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : '',
        highResCoverImage: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg` : '',
        previewLink: item.key ? `https://openlibrary.org${item.key}` : '',
        infoLink: item.key ? `https://openlibrary.org${item.key}` : '',
        saleability: 'NOT_FOR_SALE',
        country: 'US',
        price: priceData.price,
        currency: priceData.currency,
        stock: priceData.stock,
        priceSource: priceData.priceSource,
        stockSource: priceData.stockSource,
        googleBookId: '',
        isbn10: Array.isArray(item.isbn) ? item.isbn.find((entry) => String(entry).length === 10) || '' : '',
        isbn13: Array.isArray(item.isbn) ? item.isbn.find((entry) => String(entry).length === 13) || '' : '',
        source: 'open-library',
    };
};

module.exports = { normalizeGoogleBook, normalizeOpenLibraryBook };
