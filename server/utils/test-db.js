require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Author = require('../models/Author');

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected');
        await Author.deleteMany();
        const a = await Author.create({ name: 'Test', biography: 'Test' });
        console.log('Created:', a);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}
test();
