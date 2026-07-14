const CATEGORY_PRICE_MULTIPLIERS = {
    fiction: 1.0,
    fantasy: 1.05,
    romance: 0.95,
    mystery: 1.02,
    thriller: 1.08,
    science: 1.12,
    technology: 1.18,
    programming: 1.2,
    java: 1.15,
    python: 1.14,
    javascript: 1.16,
    react: 1.14,
    'node.js': 1.16,
    mongodb: 1.15,
    'artificial intelligence': 1.22,
    'machine learning': 1.21,
    'data science': 1.2,
    history: 0.98,
    biography: 1.03,
    business: 1.1,
    finance: 1.12,
    'self help': 1.01,
    psychology: 1.03,
    health: 1.01,
    children: 0.9,
    philosophy: 1.0,
    education: 0.97,
};

const getCategoryKey = (categoryName = '') => {
    const normalized = String(categoryName).toLowerCase();
    if (!normalized) return 'fiction';
    return Object.keys(CATEGORY_PRICE_MULTIPLIERS).find((key) => normalized.includes(key)) || normalized.split(/[^a-z]+/).find(Boolean) || 'fiction';
};

const generatePriceAndStock = ({ pageCount = 200, categoryName = '', source = 'google' }) => {
    const categoryKey = getCategoryKey(categoryName);
    const multiplier = CATEGORY_PRICE_MULTIPLIERS[categoryKey] || 1.0;
    const basePrice = 180 + Math.min(pageCount * 1.45, 1200);
    const price = Math.round(basePrice * multiplier / 10) * 10;
    const stock = Math.max(8, Math.min(120, Math.round((pageCount / 18) + (source === 'google' ? 10 : 8) + (multiplier * 4))));

    return {
        price,
        currency: 'INR',
        stock,
        priceSource: 'generated',
        stockSource: 'generated',
    };
};

module.exports = { generatePriceAndStock };
