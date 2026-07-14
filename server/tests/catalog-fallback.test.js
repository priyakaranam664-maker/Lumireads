const test = require('node:test');
const assert = require('node:assert/strict');
const { isDbUnavailableError, getFallbackBooksResponse, getFallbackCategoriesResponse, getFallbackBannersResponse } = require('../utils/fallbackData');

test('detects database timeout errors', () => {
    const error = new Error('Operation `books.countDocuments()` buffering timed out after 10000ms');
    assert.equal(isDbUnavailableError(error), true);
});

test('returns fallback book data when the database is unavailable', () => {
    const response = getFallbackBooksResponse({ limit: 3, page: 1 });
    assert.equal(response.success, true);
    assert.ok(Array.isArray(response.data));
    assert.equal(response.data.length, 3);
    assert.ok(response.data[0].title);
});

test('returns fallback categories data when the database is unavailable', () => {
    const response = getFallbackCategoriesResponse();
    assert.equal(response.success, true);
    assert.ok(Array.isArray(response.data));
    assert.ok(response.data.length > 0);
});

test('returns fallback banners data when the database is unavailable', () => {
    const response = getFallbackBannersResponse();
    assert.equal(response.success, true);
    assert.ok(Array.isArray(response.data));
    assert.ok(response.data.length > 0);
});
