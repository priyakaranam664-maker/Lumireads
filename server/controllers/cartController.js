const Cart = require('../models/Cart');
const Book = require('../models/Book');
const Coupon = require('../models/Coupon');

// @desc    Get user cart
exports.getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id })
            .populate({
                path: 'items.book',
                select: 'title slug coverImage price finalPrice discountPercent stockQuantity author',
                populate: { path: 'author', select: 'name' },
            })
            .populate('coupon', 'code discountType discountValue');

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        res.status(200).json({ success: true, data: cart });
    } catch (error) { next(error); }
};

// @desc    Add item to cart
exports.addToCart = async (req, res, next) => {
    try {
        const { bookId, quantity = 1 } = req.body;
        const book = await Book.findById(bookId);

        if (!book || !book.isActive) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }
        if (book.stockQuantity < quantity) {
            return res.status(400).json({ success: false, message: 'Insufficient stock' });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        const existingItem = cart.items.find((item) => item.book.toString() === bookId);
        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.price = book.price;
            existingItem.finalPrice = book.finalPrice;
        } else {
            cart.items.push({ book: bookId, quantity, price: book.price, finalPrice: book.finalPrice });
        }

        await cart.save();
        await cart.populate({
            path: 'items.book',
            select: 'title slug coverImage price finalPrice discountPercent stockQuantity author',
            populate: { path: 'author', select: 'name' },
        });

        res.status(200).json({ success: true, data: cart, message: 'Item added to cart' });
    } catch (error) { next(error); }
};

// @desc    Update cart item quantity
exports.updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        const item = cart.items.find((i) => i.book.toString() === req.params.bookId);
        if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' });

        const book = await Book.findById(req.params.bookId);
        if (quantity > book.stockQuantity) {
            return res.status(400).json({ success: false, message: 'Insufficient stock' });
        }

        item.quantity = quantity;
        item.price = book.price;
        item.finalPrice = book.finalPrice;
        await cart.save();

        await cart.populate({
            path: 'items.book',
            select: 'title slug coverImage price finalPrice discountPercent stockQuantity author',
            populate: { path: 'author', select: 'name' },
        });

        res.status(200).json({ success: true, data: cart, message: 'Cart updated' });
    } catch (error) { next(error); }
};

// @desc    Remove item from cart
exports.removeFromCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        cart.items = cart.items.filter((i) => i.book.toString() !== req.params.bookId);
        await cart.save();

        await cart.populate({
            path: 'items.book',
            select: 'title slug coverImage price finalPrice discountPercent stockQuantity author',
            populate: { path: 'author', select: 'name' },
        });

        res.status(200).json({ success: true, data: cart, message: 'Item removed from cart' });
    } catch (error) { next(error); }
};

// @desc    Clear cart
exports.clearCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            cart.coupon = undefined;
            cart.couponDiscount = 0;
            await cart.save();
        }
        res.status(200).json({ success: true, data: cart, message: 'Cart cleared' });
    } catch (error) { next(error); }
};

// @desc    Apply coupon
exports.applyCoupon = async (req, res, next) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon || !coupon.isValid()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired coupon' });
        }

        const alreadyUsed = coupon.usedBy.filter((u) => u.user.toString() === req.user._id.toString());
        if (alreadyUsed.length >= coupon.perUserLimit) {
            return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
        }

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        const subtotal = cart.items.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
        if (subtotal < coupon.minOrderAmount) {
            return res.status(400).json({ success: false, message: `Minimum order ₹${coupon.minOrderAmount} required` });
        }

        let discount = coupon.discountType === 'percentage'
            ? (subtotal * coupon.discountValue) / 100
            : coupon.discountValue;

        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
        }

        cart.coupon = coupon._id;
        cart.couponDiscount = Math.round(discount * 100) / 100;
        await cart.save();

        await cart.populate({
            path: 'items.book',
            select: 'title slug coverImage price finalPrice discountPercent stockQuantity author',
            populate: { path: 'author', select: 'name' },
        });

        res.status(200).json({ success: true, data: cart, message: `Coupon applied! You save ₹${discount.toFixed(2)}` });
    } catch (error) { next(error); }
};

// @desc    Remove coupon
exports.removeCoupon = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.coupon = undefined;
            cart.couponDiscount = 0;
            await cart.save();
        }
        res.status(200).json({ success: true, data: cart, message: 'Coupon removed' });
    } catch (error) { next(error); }
};
