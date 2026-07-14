const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const storeFile = path.join(__dirname, '..', 'data', 'auth-users.json');

const ensureStore = () => {
    const dir = path.dirname(storeFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(storeFile)) fs.writeFileSync(storeFile, JSON.stringify([], null, 2));
};

const readStore = () => {
    ensureStore();
    return JSON.parse(fs.readFileSync(storeFile, 'utf8'));
};

const writeStore = (users) => {
    ensureStore();
    fs.writeFileSync(storeFile, JSON.stringify(users, null, 2));
};

const createUser = async ({ fullName, email, password, role = 'user' }) => {
    const users = readStore();
    if (users.some((u) => u.email === email)) {
        const error = new Error('Email already registered');
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = {
        id: crypto.randomUUID(),
        fullName,
        email,
        password: hashedPassword,
        role,
        isActive: true,
        isEmailVerified: false,
        refreshTokens: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    users.push(user);
    writeStore(users);
    return user;
};

const findUserByEmail = async (email) => {
    const users = readStore();
    return users.find((u) => u.email === email) || null;
};

const verifyPassword = async (candidate, user) => {
    if (!user || !user.password) return false;
    return bcrypt.compare(candidate, user.password);
};

module.exports = { createUser, findUserByEmail, verifyPassword };
