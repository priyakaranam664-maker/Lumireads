const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Author = require('../models/Author');
const Publisher = require('../models/Publisher');
const Book = require('../models/Book');
const { Banner } = require('../models/Others');
const Coupon = require('../models/Coupon');

const seed = async () => {
    try {
        await connectDB();
        console.log('🌱 Clearing existing data...');
        await Promise.all([
            User.deleteMany(),
            Category.deleteMany(),
            Author.deleteMany(),
            Publisher.deleteMany(),
            Book.deleteMany(),
            Banner.deleteMany(),
            Coupon.deleteMany(),
        ]);

        console.log('🌱 Creating Users...');
        const adminUser = await User.create({
            fullName: 'Admin User',
            email: 'admin@bookstore.com',
            password: 'Admin@123',
            role: 'admin',
            isEmailVerified: true
        });
        const regularUser = await User.create({
            fullName: 'John Doe',
            email: 'john@example.com',
            password: 'User@123',
            role: 'user',
            isEmailVerified: true
        });

        console.log('🌱 Creating Categories...');
        const categoriesData = [
            { name: 'Fiction', description: 'Immersive stories, novels, and literature from classic to contemporary.', icon: '📚', isFeatured: true },
            { name: 'Technology', description: 'Software engineering, design patterns, coding tutorials, and computer science.', icon: '💻', isFeatured: true },
            { name: 'Self-Help', description: 'Habits, psychology, productivity, and personal development guides.', icon: '🧠', isFeatured: true },
            { name: 'Business & Finance', description: 'Investing strategy, startup advice, entrepreneurship, and economics.', icon: '📈', isFeatured: true },
            { name: 'Science & Math', description: 'Deep tech, physics, astronomy, history, and scientific discoveries.', icon: '🔬', isFeatured: true },
            { name: 'Biography', description: 'Life stories of inspiring historical figures, leaders, and innovators.', icon: '👤', isFeatured: true },
            { name: 'Philosophy', description: 'Explore the deepest questions about existence, morality, and the mind.', icon: '🤔', isFeatured: true },
            { name: 'Health & Wellness', description: 'Nutrition, fitness, mental health, and holistic well-being guides.', icon: '🏃', isFeatured: true }
        ];

        const categories = {};
        for (const cat of categoriesData) {
            const doc = await Category.create(cat);
            categories[cat.name] = doc;
        }

        console.log('🌱 Creating Authors...');
        const authorsData = [
            { name: 'J.K. Rowling', biography: 'British author, best known for writing the Harry Potter fantasy series.', country: 'United Kingdom', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200' },
            { name: 'Harper Lee', biography: 'American novelist widely known for her 1960 Pulitzer Prize-winning bestseller To Kill a Mockingbird.', country: 'United States', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200' },
            { name: 'George Orwell', biography: 'English novelist, essayist, journalist, and critic noted for his social themes and opposition to totalitarianism.', country: 'United Kingdom', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
            { name: 'Robert C. Martin', biography: 'American software engineer widely known as "Uncle Bob" and a co-author of the Agile Manifesto.', country: 'United States', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' },
            { name: 'Martin Kleppmann', biography: 'Researcher in distributed systems at the University of Cambridge and author of Designing Data-Intensive Applications.', country: 'Germany', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
            { name: 'James Clear', biography: 'Author and speaker focused on habits, decision-making, and continuous improvement.', country: 'United States', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200' },
            { name: 'Mark Manson', biography: 'Popular self-help blogger and author of global phenomenon self-help books.', country: 'United States', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200' },
            { name: 'Stephen Hawking', biography: 'Theoretical physicist, cosmologist, and author who was director of research at the Centre for Theoretical Cosmology.', country: 'United Kingdom', photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200' },
            { name: 'Yuval Noah Harari', biography: 'Israeli public intellectual, historian and professor in the Department of History at the Hebrew University of Jerusalem.', country: 'Israel', photo: 'https://images.unsplash.com/photo-1548449112-96a38a643324?w=200' },
            { name: 'Walter Isaacson', biography: 'American author, journalist, and professor best known for outstanding biographies of Steve Jobs, Albert Einstein, and Leonardo da Vinci.', country: 'United States', photo: 'https://images.unsplash.com/photo-1499996860823-5f82763f6e72?w=200' },
            { name: 'Peter Thiel', biography: 'Billionaire entrepreneur, venture capitalist, and co-founder of PayPal and Palantir.', country: 'United States', photo: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200' },
            { name: 'Michelle Obama', biography: 'American attorney and author who served as the first lady of the United States from 2009 to 2017.', country: 'United States', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200' },
            { name: 'Paulo Coelho', biography: 'Brazilian lyricist and novelist, best known for The Alchemist. His works have sold over 350 million copies worldwide.', country: 'Brazil', photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' },
            { name: 'Dale Carnegie', biography: 'American writer and lecturer known for self-improvement and interpersonal skills courses.', country: 'United States', photo: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=200' },
            { name: 'Ryan Holiday', biography: 'American author, marketer, and entrepreneur known for his writings on philosophy and strategy.', country: 'United States', photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200' },
            { name: 'Cal Newport', biography: 'Associate Professor of Computer Science at Georgetown University and author of bestselling books on focus and productivity.', country: 'United States', photo: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=200' },
            { name: 'Malcolm Gladwell', biography: 'Canadian journalist, author, and public speaker, known for his unique perspective on popular culture.', country: 'Canada', photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200' },
            { name: 'Eric Ries', biography: 'American entrepreneur, blogger, and author of The Lean Startup methodology.', country: 'United States', photo: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200' },
            { name: 'Daniel Kahneman', biography: 'Israeli-American psychologist and Nobel Prize winner known for his work on behavioral economics.', country: 'Israel', photo: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=200' },
            { name: 'Matthew Walker', biography: 'British scientist and professor of neuroscience and psychology, expert on sleep science.', country: 'United Kingdom', photo: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=200' }
        ];

        const authors = {};
        for (const auth of authorsData) {
            const doc = await Author.create(auth);
            authors[auth.name] = doc;
        }

        console.log('🌱 Creating Publishers...');
        const publishersData = [
            { name: 'Penguin Random House', website: 'https://penguinrandomhouse.com', description: 'One of the world\'s largest general-interest paperback publishers.' },
            { name: 'HarperCollins', website: 'https://harpercollins.com', description: 'One of the world\'s largest publishing companies.' },
            { name: "O'Reilly Media", website: 'https://oreilly.com', description: 'World-renowned publisher of computer science and technology books.' },
            { name: 'Cambridge University Press', website: 'https://cambridge.org', description: 'Academic and professional publisher.' },
            { name: 'Simon & Schuster', website: 'https://simonandschuster.com', description: 'American publishing company and one of the Big Five.' },
            { name: 'Macmillan Publishers', website: 'https://macmillan.com', description: 'British publishing company owned by Holtzbrinck Publishing Group.' }
        ];

        const publishers = {};
        for (const pub of publishersData) {
            const doc = await Publisher.create(pub);
            publishers[pub.name] = doc;
        }

        console.log('🌱 Creating 30+ Books...');
        const booksData = [
            // ═══════════════ FICTION (6 books) ═══════════════
            {
                title: "Harry Potter and the Sorcerer's Stone",
                isbn: '9780590353428',
                author: authors['J.K. Rowling']._id,
                category: categories['Fiction']._id,
                publisher: publishers['Penguin Random House']._id,
                description: 'Enter the magical world of Hogwarts. Harry Potter discovers he is a wizard at age 11 and enters a world of magic, friendship, and danger. A timeless coming-of-age story that has captivated millions of readers worldwide.',
                shortDescription: 'The magical beginning of the world-famous Harry Potter series.',
                price: 699, discountPercent: 15, stockQuantity: 100,
                coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
                isFeatured: true, isBestSeller: true, isNewArrival: false, isTrending: true,
                averageRating: 4.8, totalReviews: 890, totalSold: 1520, format: 'Paperback',
                pages: 320, language: 'English', tags: ['fantasy', 'magic', 'adventure', 'hogwarts']
            },
            {
                title: 'To Kill a Mockingbird',
                isbn: '9780446310789',
                author: authors['Harper Lee']._id,
                category: categories['Fiction']._id,
                publisher: publishers['HarperCollins']._id,
                description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it. Through the young eyes of Scout Finch, we witness racial injustice and moral courage in Depression-era Alabama.',
                shortDescription: 'A masterpiece of American literature about justice and racial equality.',
                price: 499, discountPercent: 10, stockQuantity: 45,
                coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400',
                isFeatured: false, isBestSeller: true, isNewArrival: false, isTrending: false,
                averageRating: 4.9, totalReviews: 420, totalSold: 980, format: 'Paperback',
                pages: 336, language: 'English', tags: ['classic', 'justice', 'southern-gothic']
            },
            {
                title: '1984',
                isbn: '9780451524935',
                author: authors['George Orwell']._id,
                category: categories['Fiction']._id,
                publisher: publishers['Penguin Random House']._id,
                description: 'Winston Smith toes the Party line, rewriting history to satisfy the demands of the Ministry of Truth. With every act of rebellion, Winston grows to hate the totalitarian regime that rules Britain under Big Brother.',
                shortDescription: 'A chilling dystopian masterpiece about surveillance and control.',
                price: 399, discountPercent: 5, stockQuantity: 80,
                coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
                isFeatured: true, isBestSeller: false, isNewArrival: false, isTrending: true,
                averageRating: 4.7, totalReviews: 610, totalSold: 1100, format: 'Paperback',
                pages: 328, language: 'English', tags: ['dystopian', 'political', 'classic']
            },
            {
                title: 'The Alchemist',
                isbn: '9780062315007',
                author: authors['Paulo Coelho']._id,
                category: categories['Fiction']._id,
                publisher: publishers['HarperCollins']._id,
                description: 'Follow Santiago, an Andalusian shepherd boy, on his journey to the Egyptian pyramids in search of treasure. Along the way, he discovers the language of the world and the wisdom of his own heart.',
                shortDescription: 'A magical tale about following your dreams and finding your destiny.',
                price: 350, discountPercent: 20, stockQuantity: 150,
                coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400',
                isFeatured: true, isBestSeller: true, isNewArrival: false, isTrending: true,
                averageRating: 4.6, totalReviews: 1800, totalSold: 3200, format: 'Paperback',
                pages: 197, language: 'English', tags: ['philosophical', 'adventure', 'inspirational']
            },
            {
                title: 'Animal Farm',
                isbn: '9780451526342',
                author: authors['George Orwell']._id,
                category: categories['Fiction']._id,
                publisher: publishers['Penguin Random House']._id,
                description: "A farm is taken over by its overworked, mistreated animals. With flaming idealism and stirring slogans, they set out to create a paradise of progress, justice, and equality. A devastating satire still ferociously fresh.",
                shortDescription: "Orwell's timeless political satire about power and corruption.",
                price: 299, discountPercent: 8, stockQuantity: 90,
                coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
                isFeatured: false, isBestSeller: false, isNewArrival: true, isTrending: false,
                averageRating: 4.5, totalReviews: 350, totalSold: 720, format: 'Paperback',
                pages: 141, language: 'English', tags: ['satire', 'political', 'allegory']
            },
            {
                title: 'Harry Potter and the Chamber of Secrets',
                isbn: '9780439064873',
                author: authors['J.K. Rowling']._id,
                category: categories['Fiction']._id,
                publisher: publishers['Penguin Random House']._id,
                description: "The Dursleys were so mean and hideous that summer that all Harry Potter wanted was to get back to Hogwarts. But just as he's packing his bags, Harry receives a warning: terrible things are about to happen at Hogwarts.",
                shortDescription: 'The thrilling second year at Hogwarts School of Witchcraft.',
                price: 699, discountPercent: 12, stockQuantity: 75,
                coverImage: 'https://images.unsplash.com/photo-1629992101753-56d196c8adf7?w=400',
                isFeatured: false, isBestSeller: true, isNewArrival: false, isTrending: false,
                averageRating: 4.7, totalReviews: 640, totalSold: 1100, format: 'Paperback',
                pages: 352, language: 'English', tags: ['fantasy', 'magic', 'adventure', 'hogwarts']
            },

            // ═══════════════ TECHNOLOGY (5 books) ═══════════════
            {
                title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
                isbn: '9780132350884',
                author: authors['Robert C. Martin']._id,
                category: categories['Technology']._id,
                publisher: publishers["O'Reilly Media"]._id,
                description: "Even bad code can run. But if code isn't clean, it can bring a development organization to its knees. Master standard agile software craftsmanship and write code that humans and machines can both appreciate.",
                shortDescription: "Uncle Bob's definitive guide to writing clean, maintainable code.",
                price: 899, discountPercent: 20, stockQuantity: 50,
                coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400',
                isFeatured: true, isBestSeller: true, isNewArrival: false, isTrending: true,
                averageRating: 4.6, totalReviews: 245, totalSold: 580, format: 'Paperback',
                pages: 464, language: 'English', tags: ['programming', 'software-engineering', 'agile']
            },
            {
                title: 'Designing Data-Intensive Applications',
                isbn: '9781449373322',
                author: authors['Martin Kleppmann']._id,
                category: categories['Technology']._id,
                publisher: publishers["O'Reilly Media"]._id,
                description: "The big ideas behind reliable, scalable, and maintainable systems. Determine the pros and cons of various architectures for processing and storing data at scale — the essential guide for modern software engineers.",
                shortDescription: 'The definitive guide to database engines, streaming, and scalability.',
                price: 1199, discountPercent: 10, stockQuantity: 60,
                coverImage: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=400',
                isFeatured: true, isBestSeller: true, isNewArrival: true, isTrending: true,
                averageRating: 4.9, totalReviews: 310, totalSold: 720, format: 'Hardcover',
                pages: 616, language: 'English', tags: ['distributed-systems', 'databases', 'architecture']
            },
            {
                title: 'Deep Work: Rules for Focused Success in a Distracted World',
                isbn: '9781455586691',
                author: authors['Cal Newport']._id,
                category: categories['Technology']._id,
                publisher: publishers['Penguin Random House']._id,
                description: "In an age of distraction, the ability to focus deeply is becoming both rare and valuable. Cal Newport makes the case that deep work is essential for anyone wanting to thrive in today's economy.",
                shortDescription: 'Master the art of focus in an increasingly distracted world.',
                price: 549, discountPercent: 15, stockQuantity: 85,
                coverImage: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400',
                isFeatured: true, isBestSeller: false, isNewArrival: true, isTrending: true,
                averageRating: 4.5, totalReviews: 520, totalSold: 900, format: 'Paperback',
                pages: 304, language: 'English', tags: ['productivity', 'focus', 'career']
            },
            {
                title: 'The Clean Coder: A Code of Conduct for Professional Programmers',
                isbn: '9780137081073',
                author: authors['Robert C. Martin']._id,
                category: categories['Technology']._id,
                publisher: publishers["O'Reilly Media"]._id,
                description: "Programmers who endure and succeed amidst swirling uncertainty enjoy a common attribute: craftsmanship. The Clean Coder describes the disciplines, techniques, and attitudes of a true software craftsman.",
                shortDescription: "Essential guide to professional software development conduct.",
                price: 799, discountPercent: 18, stockQuantity: 40,
                coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
                isFeatured: false, isBestSeller: false, isNewArrival: true, isTrending: false,
                averageRating: 4.4, totalReviews: 180, totalSold: 350, format: 'Paperback',
                pages: 256, language: 'English', tags: ['programming', 'professional', 'career']
            },
            {
                title: 'The Pragmatic Programmer: Your Journey to Mastery',
                isbn: '9780135957059',
                author: authors['Robert C. Martin']._id,
                category: categories['Technology']._id,
                publisher: publishers["O'Reilly Media"]._id,
                description: "Updated for modern development practices, this edition covers topics ranging from personal responsibility and career development to architectural techniques for keeping your code flexible and easy to adapt.",
                shortDescription: "A timeless guide to software craftsmanship and professional growth.",
                price: 949, discountPercent: 10, stockQuantity: 55,
                coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
                isFeatured: true, isBestSeller: true, isNewArrival: false, isTrending: true,
                averageRating: 4.8, totalReviews: 290, totalSold: 650, format: 'Hardcover',
                pages: 352, language: 'English', tags: ['programming', 'software-engineering', 'best-practices']
            },

            // ═══════════════ SELF-HELP (5 books) ═══════════════
            {
                title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones',
                isbn: '9780735211292',
                author: authors['James Clear']._id,
                category: categories['Self-Help']._id,
                publisher: publishers['Penguin Random House']._id,
                description: "No matter your goals, Atomic Habits offers a proven framework for improving—every day. You'll learn how to design environments where good habits become easy and bad habits become impossible.",
                shortDescription: 'The ultimate guide to building life-changing habits.',
                price: 599, discountPercent: 25, stockQuantity: 200,
                coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
                isFeatured: true, isBestSeller: true, isNewArrival: false, isTrending: true,
                averageRating: 4.8, totalReviews: 1250, totalSold: 3500, format: 'Paperback',
                pages: 320, language: 'English', tags: ['habits', 'productivity', 'self-improvement']
            },
            {
                title: "The Subtle Art of Not Giving a F*ck",
                isbn: '9780062457714',
                author: authors['Mark Manson']._id,
                category: categories['Self-Help']._id,
                publisher: publishers['HarperCollins']._id,
                description: "A superstar blogger cuts through the crap to show us how to stop trying to be positive all the time. Instead, Mark Manson says we should embrace our limitations and get comfortable with being different.",
                shortDescription: 'A counterintuitive approach to living a good life.',
                price: 499, discountPercent: 12, stockQuantity: 110,
                coverImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400',
                isFeatured: false, isBestSeller: true, isNewArrival: false, isTrending: true,
                averageRating: 4.4, totalReviews: 780, totalSold: 2100, format: 'Paperback',
                pages: 224, language: 'English', tags: ['mindset', 'philosophy', 'humor']
            },
            {
                title: 'How to Win Friends and Influence People',
                isbn: '9780671027032',
                author: authors['Dale Carnegie']._id,
                category: categories['Self-Help']._id,
                publisher: publishers['Simon & Schuster']._id,
                description: "The world's most popular self-help book of all time. Dale Carnegie's timeless advice has carried thousands of now-famous people up the ladder of success in their business and personal lives.",
                shortDescription: "The timeless classic on human relations and communication.",
                price: 399, discountPercent: 10, stockQuantity: 130,
                coverImage: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400',
                isFeatured: true, isBestSeller: true, isNewArrival: false, isTrending: false,
                averageRating: 4.6, totalReviews: 2100, totalSold: 5000, format: 'Paperback',
                pages: 288, language: 'English', tags: ['communication', 'leadership', 'classic']
            },
            {
                title: 'The Obstacle Is the Way: The Timeless Art of Turning Trials into Triumph',
                isbn: '9781591846352',
                author: authors['Ryan Holiday']._id,
                category: categories['Self-Help']._id,
                publisher: publishers['Penguin Random House']._id,
                description: "Ryan Holiday shows how some of the most successful people in history turned great obstacles into great advantages. Using stories from history, he teaches the art of overcoming through perception, action, and will.",
                shortDescription: "Ancient Stoic philosophy applied to modern challenges.",
                price: 499, discountPercent: 15, stockQuantity: 75,
                coverImage: 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=400',
                isFeatured: false, isBestSeller: false, isNewArrival: true, isTrending: true,
                averageRating: 4.5, totalReviews: 430, totalSold: 850, format: 'Hardcover',
                pages: 224, language: 'English', tags: ['stoicism', 'philosophy', 'resilience']
            },
            {
                title: 'Ego Is the Enemy',
                isbn: '9781591847816',
                author: authors['Ryan Holiday']._id,
                category: categories['Self-Help']._id,
                publisher: publishers['Penguin Random House']._id,
                description: "The instant Wall Street Journal, USA Today, and international bestseller. Ryan Holiday draws on stories of historical figures who conquered or were conquered by their egos.",
                shortDescription: "How ego can be your biggest enemy on the path to success.",
                price: 449, discountPercent: 10, stockQuantity: 60,
                coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
                isFeatured: false, isBestSeller: false, isNewArrival: true, isTrending: false,
                averageRating: 4.3, totalReviews: 320, totalSold: 620, format: 'Paperback',
                pages: 256, language: 'English', tags: ['stoicism', 'ego', 'humility']
            },

            // ═══════════════ BUSINESS & FINANCE (5 books) ═══════════════
            {
                title: 'Zero to One: Notes on Startups, or How to Build the Future',
                isbn: '9780804139298',
                author: authors['Peter Thiel']._id,
                category: categories['Business & Finance']._id,
                publisher: publishers['Penguin Random House']._id,
                description: "The great secret of our time is that there are still uncharted frontiers to explore. Peter Thiel shows how to think creatively about innovation and build companies that create new things worth having.",
                shortDescription: "Contrarian startup wisdom from PayPal co-founder Peter Thiel.",
                price: 650, discountPercent: 18, stockQuantity: 95,
                coverImage: 'https://images.unsplash.com/photo-1550399105-c4dbb6255d14?w=400',
                isFeatured: true, isBestSeller: true, isNewArrival: true, isTrending: true,
                averageRating: 4.5, totalReviews: 390, totalSold: 920, format: 'Hardcover',
                pages: 224, language: 'English', tags: ['startup', 'innovation', 'entrepreneurship']
            },
            {
                title: 'The Lean Startup',
                isbn: '9780307887894',
                author: authors['Eric Ries']._id,
                category: categories['Business & Finance']._id,
                publisher: publishers['Penguin Random House']._id,
                description: "Eric Ries defines a scientific approach to creating and managing successful startups. Learn when to pivot, when to persevere, and how to maximize the velocity of innovation in a startup environment.",
                shortDescription: "The methodology that changed how startups build products.",
                price: 599, discountPercent: 15, stockQuantity: 70,
                coverImage: 'https://images.unsplash.com/photo-1553729459-afe8f2e2ed65?w=400',
                isFeatured: true, isBestSeller: true, isNewArrival: false, isTrending: false,
                averageRating: 4.4, totalReviews: 680, totalSold: 1500, format: 'Paperback',
                pages: 336, language: 'English', tags: ['startup', 'lean', 'business-strategy']
            },
            {
                title: 'Outliers: The Story of Success',
                isbn: '9780316017930',
                author: authors['Malcolm Gladwell']._id,
                category: categories['Business & Finance']._id,
                publisher: publishers['Macmillan Publishers']._id,
                description: "In this stunning book, Malcolm Gladwell takes us on an intellectual journey through the world of outliers — the best and the brightest, the most famous and the most successful — to answer the question: what makes high-achievers different?",
                shortDescription: "What really makes people successful? It's not what you think.",
                price: 599, discountPercent: 20, stockQuantity: 88,
                coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
                isFeatured: true, isBestSeller: true, isNewArrival: false, isTrending: true,
                averageRating: 4.5, totalReviews: 950, totalSold: 2200, format: 'Paperback',
                pages: 309, language: 'English', tags: ['success', 'psychology', 'society']
            },
            {
                title: 'Thinking, Fast and Slow',
                isbn: '9780374533557',
                author: authors['Daniel Kahneman']._id,
                category: categories['Business & Finance']._id,
                publisher: publishers['Penguin Random House']._id,
                description: "Nobel laureate Daniel Kahneman takes the reader on a groundbreaking tour of the mind and explains the two systems that drive the way we think: System 1 (fast, intuitive) and System 2 (slow, deliberate).",
                shortDescription: "Nobel Prize-winning insights into how we make decisions.",
                price: 749, discountPercent: 15, stockQuantity: 65,
                coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                isFeatured: true, isBestSeller: true, isNewArrival: false, isTrending: true,
                averageRating: 4.6, totalReviews: 1100, totalSold: 2800, format: 'Paperback',
                pages: 499, language: 'English', tags: ['psychology', 'economics', 'decision-making']
            },
            {
                title: 'The Tipping Point: How Little Things Can Make a Big Difference',
                isbn: '9780316346627',
                author: authors['Malcolm Gladwell']._id,
                category: categories['Business & Finance']._id,
                publisher: publishers['Macmillan Publishers']._id,
                description: "The tipping point is that magic moment when an idea, trend, or social behavior crosses a threshold, tips, and spreads like wildfire. Gladwell examines what causes dramatic change in our everyday lives.",
                shortDescription: "How ideas spread and what causes social epidemics.",
                price: 499, discountPercent: 12, stockQuantity: 55,
                coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
                isFeatured: false, isBestSeller: false, isNewArrival: true, isTrending: false,
                averageRating: 4.3, totalReviews: 720, totalSold: 1800, format: 'Paperback',
                pages: 301, language: 'English', tags: ['sociology', 'marketing', 'trends']
            },

            // ═══════════════ SCIENCE & MATH (4 books) ═══════════════
            {
                title: 'A Brief History of Time',
                isbn: '9780553380163',
                author: authors['Stephen Hawking']._id,
                category: categories['Science & Math']._id,
                publisher: publishers['Penguin Random House']._id,
                description: "A landmark volume in science writing by one of the great minds of our time. From the Big Bang to black holes, Stephen Hawking explores the boundaries of what we know about the cosmos.",
                shortDescription: 'A journey through space, time, and the cosmos.',
                price: 499, discountPercent: 15, stockQuantity: 70,
                coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
                isFeatured: true, isBestSeller: false, isNewArrival: false, isTrending: false,
                averageRating: 4.7, totalReviews: 320, totalSold: 750, format: 'Paperback',
                pages: 212, language: 'English', tags: ['physics', 'cosmology', 'science']
            },
            {
                title: 'Sapiens: A Brief History of Humankind',
                isbn: '9780062316097',
                author: authors['Yuval Noah Harari']._id,
                category: categories['Science & Math']._id,
                publisher: publishers['HarperCollins']._id,
                description: "Sapiens integrates history and science to reconsider everything we thought we knew about being human. How did Homo sapiens come to dominate the globe? What happens when our species tries to play God?",
                shortDescription: 'A sweeping epic of human history from cave to civilization.',
                price: 799, discountPercent: 22, stockQuantity: 120,
                coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400',
                isFeatured: true, isBestSeller: true, isNewArrival: false, isTrending: true,
                averageRating: 4.6, totalReviews: 890, totalSold: 2400, format: 'Paperback',
                pages: 464, language: 'English', tags: ['history', 'anthropology', 'evolution']
            },
            {
                title: 'Homo Deus: A Brief History of Tomorrow',
                isbn: '9780062464316',
                author: authors['Yuval Noah Harari']._id,
                category: categories['Science & Math']._id,
                publisher: publishers['HarperCollins']._id,
                description: "Yuval Noah Harari envisions a near future in which we face a new set of challenges. What will happen to democracy, equality, and ordinary life when our algorithms know us better than we know ourselves?",
                shortDescription: "A bold examination of humanity's future with AI and biotech.",
                price: 699, discountPercent: 18, stockQuantity: 65,
                coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
                isFeatured: false, isBestSeller: false, isNewArrival: true, isTrending: true,
                averageRating: 4.4, totalReviews: 450, totalSold: 900, format: 'Hardcover',
                pages: 464, language: 'English', tags: ['future', 'technology', 'philosophy']
            },
            {
                title: 'Why We Sleep: Unlocking the Power of Sleep and Dreams',
                isbn: '9781501144325',
                author: authors['Matthew Walker']._id,
                category: categories['Science & Math']._id,
                publisher: publishers['Simon & Schuster']._id,
                description: "A revolutionary exploration of sleep that examines how it affects every aspect of our physical and mental well-being. Matthew Walker reveals the vital importance of sleep as the greatest life hack known to science.",
                shortDescription: "The science of sleep and why it matters more than you think.",
                price: 549, discountPercent: 15, stockQuantity: 90,
                coverImage: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400',
                isFeatured: true, isBestSeller: true, isNewArrival: true, isTrending: true,
                averageRating: 4.7, totalReviews: 680, totalSold: 1500, format: 'Paperback',
                pages: 368, language: 'English', tags: ['sleep', 'neuroscience', 'health']
            },

            // ═══════════════ BIOGRAPHY (4 books) ═══════════════
            {
                title: 'Steve Jobs',
                isbn: '9781451648539',
                author: authors['Walter Isaacson']._id,
                category: categories['Biography']._id,
                publisher: publishers['Simon & Schuster']._id,
                description: "The exclusive, bestselling biography of Steve Jobs, based on more than forty interviews conducted over two years. A riveting story of the roller-coaster life and searingly intense personality of Apple's creative genius.",
                shortDescription: 'The definitive biography of Apple\'s visionary co-founder.',
                price: 899, discountPercent: 30, stockQuantity: 40,
                coverImage: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=400',
                isFeatured: true, isBestSeller: true, isNewArrival: false, isTrending: true,
                averageRating: 4.7, totalReviews: 540, totalSold: 1200, format: 'Hardcover',
                pages: 656, language: 'English', tags: ['apple', 'technology', 'innovation']
            },
            {
                title: 'Becoming',
                isbn: '9781524763138',
                author: authors['Michelle Obama']._id,
                category: categories['Biography']._id,
                publisher: publishers['Penguin Random House']._id,
                description: "An intimate, powerful, and inspiring memoir by the former First Lady of the United States. Michelle Obama invites readers into her world, chronicling the experiences that shaped her from Chicago to the White House.",
                shortDescription: 'A powerful memoir of identity, achievement, and hope.',
                price: 799, discountPercent: 10, stockQuantity: 85,
                coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400',
                isFeatured: false, isBestSeller: true, isNewArrival: true, isTrending: false,
                averageRating: 4.8, totalReviews: 670, totalSold: 1600, format: 'Paperback',
                pages: 448, language: 'English', tags: ['memoir', 'politics', 'inspiration']
            },
            {
                title: 'Leonardo da Vinci',
                isbn: '9781501139161',
                author: authors['Walter Isaacson']._id,
                category: categories['Biography']._id,
                publisher: publishers['Simon & Schuster']._id,
                description: "Drawing on thousands of pages from Leonardo's astonishing notebooks, Walter Isaacson weaves a narrative that connects his art to his science. He shows how Leonardo's genius was based on skills we can improve in ourselves.",
                shortDescription: "A masterful portrait of the ultimate Renaissance man.",
                price: 999, discountPercent: 20, stockQuantity: 35,
                coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                isFeatured: true, isBestSeller: false, isNewArrival: true, isTrending: true,
                averageRating: 4.6, totalReviews: 280, totalSold: 550, format: 'Hardcover',
                pages: 624, language: 'English', tags: ['renaissance', 'art', 'genius']
            },
            {
                title: 'Einstein: His Life and Universe',
                isbn: '9780743264747',
                author: authors['Walter Isaacson']._id,
                category: categories['Biography']._id,
                publisher: publishers['Simon & Schuster']._id,
                description: "The definitive biography of the greatest genius of our age. Isaacson explores how a rebellious imagination nurtured Einstein's creative genius—and what we can learn from his example about our own creativity.",
                shortDescription: "The definitive portrait of the world's greatest physicist.",
                price: 849, discountPercent: 15, stockQuantity: 45,
                coverImage: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400',
                isFeatured: false, isBestSeller: false, isNewArrival: false, isTrending: false,
                averageRating: 4.5, totalReviews: 310, totalSold: 680, format: 'Paperback',
                pages: 704, language: 'English', tags: ['physics', 'genius', 'science']
            },

            // ═══════════════ PHILOSOPHY (2 books) ═══════════════
            {
                title: 'Meditations',
                isbn: '9780140449334',
                author: authors['Ryan Holiday']._id,
                category: categories['Philosophy']._id,
                publisher: publishers['Penguin Random House']._id,
                description: "The private reflections of the Roman Emperor Marcus Aurelius, written as a source of his own guidance and self-improvement. A timeless work of Stoic philosophy that has guided leaders for nearly two millennia.",
                shortDescription: "Marcus Aurelius' timeless guide to Stoic philosophy and self-mastery.",
                price: 299, discountPercent: 5, stockQuantity: 100,
                coverImage: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=400',
                isFeatured: true, isBestSeller: false, isNewArrival: false, isTrending: true,
                averageRating: 4.7, totalReviews: 1500, totalSold: 4000, format: 'Paperback',
                pages: 256, language: 'English', tags: ['stoicism', 'philosophy', 'ancient']
            },
            {
                title: '21 Lessons for the 21st Century',
                isbn: '9780525512196',
                author: authors['Yuval Noah Harari']._id,
                category: categories['Philosophy']._id,
                publisher: publishers['Penguin Random House']._id,
                description: "Yuval Noah Harari cuts through the noise of our age to address some of the most urgent questions facing humanity today: terrorism, fake news, immigration, and the rise of artificial intelligence.",
                shortDescription: "Essential wisdom for navigating the challenges of modern life.",
                price: 699, discountPercent: 18, stockQuantity: 70,
                coverImage: 'https://images.unsplash.com/photo-1510172951991-856a58b6d9a8?w=400',
                isFeatured: true, isBestSeller: true, isNewArrival: true, isTrending: true,
                averageRating: 4.4, totalReviews: 520, totalSold: 1100, format: 'Hardcover',
                pages: 372, language: 'English', tags: ['philosophy', 'politics', 'future', 'AI']
            },

            // ═══════════════ HEALTH & WELLNESS (2 books) ═══════════════
            {
                title: 'Blink: The Power of Thinking Without Thinking',
                isbn: '9780316010665',
                author: authors['Malcolm Gladwell']._id,
                category: categories['Health & Wellness']._id,
                publisher: publishers['Macmillan Publishers']._id,
                description: "Malcolm Gladwell reveals that great decision makers aren't those who process the most information or deliberate the longest, but those who have perfected the art of 'thin-slicing' — filtering the factors that matter.",
                shortDescription: "How snap judgments can be more powerful than careful analysis.",
                price: 499, discountPercent: 10, stockQuantity: 80,
                coverImage: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=400',
                isFeatured: false, isBestSeller: false, isNewArrival: false, isTrending: false,
                averageRating: 4.2, totalReviews: 620, totalSold: 1400, format: 'Paperback',
                pages: 296, language: 'English', tags: ['psychology', 'intuition', 'decision-making']
            },
            {
                title: "Everything Is F*cked: A Book About Hope",
                isbn: '9780062888433',
                author: authors['Mark Manson']._id,
                category: categories['Health & Wellness']._id,
                publisher: publishers['HarperCollins']._id,
                description: "Mark Manson turns his philosophical eye to something many of us struggle with: our relationship with hope. In this thought-provoking follow-up, he examines our crisis of hope and what we can do about it.",
                shortDescription: "A philosophical exploration of hope in the modern age.",
                price: 549, discountPercent: 15, stockQuantity: 65,
                coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
                isFeatured: false, isBestSeller: false, isNewArrival: true, isTrending: false,
                averageRating: 4.1, totalReviews: 340, totalSold: 750, format: 'Paperback',
                pages: 288, language: 'English', tags: ['philosophy', 'hope', 'meaning']
            }
        ];

        for (const book of booksData) {
            await Book.create(book);
        }

        console.log('🌱 Updating book counts for Categories, Authors, and Publishers...');
        const allCategories = await Category.find();
        for (const cat of allCategories) {
            const count = await Book.countDocuments({ category: cat._id });
            cat.bookCount = count;
            await cat.save();
        }

        const allAuthors = await Author.find();
        for (const auth of allAuthors) {
            const count = await Book.countDocuments({ author: auth._id });
            auth.bookCount = count;
            await auth.save();
        }

        const allPublishers = await Publisher.find();
        for (const pub of allPublishers) {
            const count = await Book.countDocuments({ publisher: pub._id });
            pub.bookCount = count;
            await pub.save();
        }

        console.log('🌱 Creating Banners & Coupons...');
        await Banner.create({
            title: 'Summer Reading Festival',
            subtitle: 'Unleash your mind. Up to 40% discount on featured literature.',
            image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200',
            position: 'hero',
            link: '/books?isFeatured=true'
        });
        await Banner.create({
            title: 'Tech & Knowledge Sale',
            subtitle: 'Get 25% off on Tech & Self-Help books. Use code READMORE25.',
            image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=1200',
            position: 'hero',
            link: '/books?hasDiscount=true'
        });
        await Banner.create({
            title: 'New Arrivals Just Dropped',
            subtitle: 'Fresh titles across every genre. Discover your next obsession.',
            image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200',
            position: 'hero',
            link: '/books?isNewArrival=true'
        });

        const now = new Date();
        const future = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        await Coupon.create({ code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minOrderAmount: 100, validFrom: now, validUntil: future, isActive: true });
        await Coupon.create({ code: 'READMORE25', discountType: 'percentage', discountValue: 25, minOrderAmount: 800, validFrom: now, validUntil: future, isActive: true });
        await Coupon.create({ code: 'SUMMER30', discountType: 'percentage', discountValue: 30, minOrderAmount: 1500, maxDiscount: 500, validFrom: now, validUntil: future, isActive: true });
        await Coupon.create({ code: 'FLAT100', discountType: 'fixed', discountValue: 100, minOrderAmount: 500, validFrom: now, validUntil: future, isActive: true });

        console.log('\n🎉 Database Seeded Successfully! 33 books, 8 categories, 20 authors, 6 publishers, 3 banners, 4 coupons.');
        process.exit(0);
    } catch (err) {
        require('fs').writeFileSync('c:/bookstore/seeder_log.txt', err.stack || String(err));
        console.error('❌ Seed error:', err);
        process.exit(1);
    }
};

seed();
