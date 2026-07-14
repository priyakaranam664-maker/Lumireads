const test = require('node:test');
const assert = require('node:assert/strict');
const { createUser, findUserByEmail, verifyPassword } = require('../utils/authStore');

test('fallback auth store can register and authenticate a user', async () => {
    const email = `user-${Date.now()}@example.com`;

    const user = await createUser({
        fullName: 'Test User',
        email,
        password: 'secret123',
        role: 'user',
    });

    assert.equal(user.email, email);

    const found = await findUserByEmail(email);
    assert.ok(found);
    assert.equal(await verifyPassword('secret123', found), true);
});
