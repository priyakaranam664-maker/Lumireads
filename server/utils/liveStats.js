const buildLiveStatsPayload = ({ totalBooks, totalCategories, totalOrders, timestamp = new Date().toISOString() }) => ({
    totalBooks,
    totalCategories,
    totalOrders,
    timestamp,
});

module.exports = {
    buildLiveStatsPayload,
};
