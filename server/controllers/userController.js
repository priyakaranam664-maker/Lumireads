const User = require('../models/User');

// @desc    Get user profile
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist', 'title coverImage finalPrice slug author');
        res.status(200).json({ success: true, data: user });
    } catch (error) { next(error); }
};

// @desc    Update user profile
exports.updateProfile = async (req, res, next) => {
    try {
        const allowedFields = ['fullName', 'phone', 'gender', 'dateOfBirth', 'avatar', 'preferences'];
        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: user, message: 'Profile updated' });
    } catch (error) { next(error); }
};

// @desc    Add address
exports.addAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (req.body.isDefault) {
            user.addresses.forEach((addr) => (addr.isDefault = false));
        }
        user.addresses.push(req.body);
        await user.save();
        res.status(201).json({ success: true, data: user.addresses, message: 'Address added' });
    } catch (error) { next(error); }
};

// @desc    Update address
exports.updateAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const address = user.addresses.id(req.params.addressId);
        if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

        if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
        Object.assign(address, req.body);
        await user.save();
        res.status(200).json({ success: true, data: user.addresses, message: 'Address updated' });
    } catch (error) { next(error); }
};

// @desc    Delete address
exports.deleteAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
        await user.save();
        res.status(200).json({ success: true, data: user.addresses, message: 'Address deleted' });
    } catch (error) { next(error); }
};

// @desc    Toggle wishlist
exports.toggleWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const bookId = req.params.bookId;
        const index = user.wishlist.indexOf(bookId);

        if (index > -1) {
            user.wishlist.splice(index, 1);
        } else {
            user.wishlist.push(bookId);
        }
        await user.save();

        const updatedUser = await User.findById(req.user._id).populate('wishlist', 'title coverImage finalPrice slug author');
        res.status(200).json({
            success: true,
            data: updatedUser.wishlist,
            message: index > -1 ? 'Removed from wishlist' : 'Added to wishlist',
        });
    } catch (error) { next(error); }
};

// @desc    Get wishlist
exports.getWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'wishlist',
            select: 'title coverImage finalPrice price discountPercent slug author averageRating',
            populate: { path: 'author', select: 'name' },
        });
        res.status(200).json({ success: true, data: user.wishlist });
    } catch (error) { next(error); }
};

// --- Admin: Get all users ---
exports.getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;
        const filter = {};

        if (req.query.q) {
            filter.$or = [
                { fullName: { $regex: req.query.q, $options: 'i' } },
                { email: { $regex: req.query.q, $options: 'i' } },
            ];
        }
        if (req.query.role) filter.role = req.query.role;

        const total = await User.countDocuments(filter);
        const users = await User.find(filter).sort('-createdAt').skip(skip).limit(limit).lean();
        res.status(200).json({ success: true, data: users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) { next(error); }
};

// --- Admin: Update user role/status ---
exports.updateUser = async (req, res, next) => {
    try {
        const { role, isActive } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role, isActive }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, data: user, message: 'User updated' });
    } catch (error) { next(error); }
};

// --- Admin: Delete user ---
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, message: 'User deactivated' });
    } catch (error) { next(error); }
};
