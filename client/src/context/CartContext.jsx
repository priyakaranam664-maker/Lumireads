import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState(null);
    const [cartLoading, setCartLoading] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) { setCart(null); setCartCount(0); return; }
        try {
            setCartLoading(true);
            const { data } = await cartAPI.get();
            setCart(data.data);
            setCartCount(data.data?.items?.length || 0);
        } catch { /* ignore */ }
        finally { setCartLoading(false); }
    }, [isAuthenticated]);

    useEffect(() => { fetchCart(); }, [fetchCart]);

    const addToCart = async (bookId, quantity = 1) => {
        try {
            const { data } = await cartAPI.add({ bookId, quantity });
            setCart(data.data);
            setCartCount(data.data?.items?.length || 0);
            toast.success(data.message || 'Added to cart');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add to cart');
        }
    };

    const updateQuantity = async (bookId, quantity) => {
        try {
            const { data } = await cartAPI.update(bookId, { quantity });
            setCart(data.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    const removeFromCart = async (bookId) => {
        try {
            const { data } = await cartAPI.remove(bookId);
            setCart(data.data);
            setCartCount(data.data?.items?.length || 0);
            toast.success('Removed from cart');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Remove failed');
        }
    };

    const clearCart = async () => {
        try {
            await cartAPI.clear();
            setCart(null);
            setCartCount(0);
        } catch { }
    };

    const applyCoupon = async (code) => {
        try {
            const { data } = await cartAPI.applyCoupon({ code });
            setCart(data.data);
            toast.success(data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid coupon');
        }
    };

    const removeCoupon = async () => {
        try {
            const { data } = await cartAPI.removeCoupon();
            setCart(data.data);
            toast.success('Coupon removed');
        } catch { }
    };

    return (
        <CartContext.Provider value={{
            cart, cartLoading, cartCount, addToCart, updateQuantity,
            removeFromCart, clearCart, applyCoupon, removeCoupon, fetchCart,
        }}>
            {children}
        </CartContext.Provider>
    );
};
