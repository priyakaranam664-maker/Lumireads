const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, setTokenCookies, clearTokenCookies } = require('../utils/helpers');
const { sendEmail } = require('../config/email');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
    try {
        const { fullName, email, password, phone } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        const user = await User.create({ fullName, email, password, phone });

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshTokens.push({ token: refreshToken });
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        setTokenCookies(res, accessToken, refreshToken);

        const userData = user.toObject();
        delete userData.password;
        delete userData.refreshTokens;

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: { user: userData, accessToken, refreshToken },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'Account deactivated. Contact support.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Keep only last 5 refresh tokens
        if (user.refreshTokens.length >= 5) {
            user.refreshTokens = user.refreshTokens.slice(-4);
        }
        user.refreshTokens.push({ token: refreshToken });
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        setTokenCookies(res, accessToken, refreshToken);

        const userData = user.toObject();
        delete userData.password;
        delete userData.refreshTokens;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: { user: userData, accessToken, refreshToken },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
exports.refreshToken = async (req, res, next) => {
    try {
        const token = req.body.refreshToken || req.cookies.refreshToken;
        if (!token) {
            return res.status(401).json({ success: false, message: 'No refresh token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        const tokenExists = user.refreshTokens.some((t) => t.token === token);
        if (!tokenExists) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        // Rotate tokens
        user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);
        const newAccessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);
        user.refreshTokens.push({ token: newRefreshToken });
        await user.save({ validateBeforeSave: false });

        setTokenCookies(res, newAccessToken, newRefreshToken);

        res.status(200).json({
            success: true,
            data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Refresh token expired, please login again' });
        }
        next(error);
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
exports.logout = async (req, res, next) => {
    try {
        const token = req.body.refreshToken || req.cookies.refreshToken;
        if (token && req.user) {
            req.user.refreshTokens = req.user.refreshTokens.filter((t) => t.token !== token);
            await req.user.save({ validateBeforeSave: false });
        }
        clearTokenCookies(res);
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout from all devices
// @route   POST /api/auth/logout-all
exports.logoutAll = async (req, res, next) => {
    try {
        req.user.refreshTokens = [];
        await req.user.save({ validateBeforeSave: false });
        clearTokenCookies(res);
        res.status(200).json({ success: true, message: 'Logged out from all devices' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist', 'title coverImage finalPrice slug');
    res.status(200).json({ success: true, data: user });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(200).json({ success: true, message: 'If email exists, reset link has been sent' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 min
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        try {
            await sendEmail({
                to: user.email,
                subject: 'BookStore - Password Reset',
                html: `<h2>Password Reset</h2><p>Click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a><p>This link expires in 30 minutes.</p>`,
            });
        } catch (emailError) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
        }

        res.status(200).json({ success: true, message: 'If email exists, reset link has been sent' });
    } catch (error) {
        next(error);
    }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.refreshTokens = []; // Invalidate all sessions
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful. Please login.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Change password (authenticated)
// @route   PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.comparePassword(req.body.currentPassword);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = req.body.newPassword;
        user.refreshTokens = [];
        await user.save();

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        user.refreshTokens.push({ token: refreshToken });
        await user.save({ validateBeforeSave: false });

        setTokenCookies(res, accessToken, refreshToken);

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
            data: { accessToken, refreshToken },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Social Login (InsForge)
// @route   POST /api/auth/social-login
exports.socialLogin = async (req, res, next) => {
    try {
        const { email, fullName, avatar_url, provider } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required from social provider' });
        }

        let user = await User.findOne({ email });

        if (!user) {
            // Create user if doesn't exist
            user = await User.create({
                fullName: fullName || email.split('@')[0],
                email,
                avatar: avatar_url,
                isEmailVerified: true,
                password: crypto.randomBytes(32).toString('hex'), // Random password for social users
            });
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        if (user.refreshTokens.length >= 5) {
            user.refreshTokens = user.refreshTokens.slice(-4);
        }
        user.refreshTokens.push({ token: refreshToken });
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        setTokenCookies(res, accessToken, refreshToken);

        const userData = user.toObject();
        delete userData.password;
        delete userData.refreshTokens;

        res.status(200).json({
            success: true,
            message: 'Social login successful',
            data: { user: userData, accessToken, refreshToken },
        });
    } catch (error) {
        next(error);
    }
};
