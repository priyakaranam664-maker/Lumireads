import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiStar, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/premium-book-card.css';

const PremiumBookCard = ({ book, featured = false }) => {
  const { isAuthenticated, user, updateUser } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(
    user?.wishlist?.some((w) => (w._id || w) === book._id)
  );

  const rating = book.averageRating || 0;
  const reviewCount = book.reviews?.length || 0;

  const handleAddToCart = () => {
    addToCart(book._id);
    toast.success('Added to cart!');
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const newWishlist = isWishlisted
        ? user.wishlist.filter((w) => (w._id || w) !== book._id)
        : [...(user.wishlist || []), book._id];

      await updateUser({ wishlist: newWishlist });
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  if (featured) {
    return (
      <motion.div
        className="book-card-featured"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Link to={`/books/${book._id}`} className="card-link">
          <div className="featured-image-wrapper">
            <motion.img
              src={book.coverImage}
              alt={book.title}
              className="featured-image"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
            />
            <div className="featured-overlay">
              <motion.div
                className="featured-badge"
                initial={{ y: -20, opacity: 0 }}
                whileHover={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <FiEye size={16} />
                <span>View Details</span>
              </motion.div>
            </div>
          </div>

          <div className="featured-content">
            <div className="featured-category">
              {book.category?.name || 'General'}
            </div>
            <h3 className="featured-title">{book.title}</h3>
            <p className="featured-author">{book.author?.name || 'Unknown Author'}</p>

            <div className="featured-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    size={16}
                    className={i < Math.round(rating) ? 'filled' : ''}
                  />
                ))}
              </div>
              <span className="review-count">({reviewCount})</span>
            </div>

            <p className="featured-description">
              {book.description?.slice(0, 100)}...
            </p>

            <div className="featured-footer">
              <div className="price-tag">₹{book.price}</div>
              <motion.button
                className="btn-primary featured-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToCart();
                }}
              >
                <FiShoppingCart size={18} />
                Add
              </motion.button>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Regular Card
  return (
    <motion.div
      className="book-card-premium"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/books/${book._id}`} className="card-link">
        <div className="card-image-wrapper">
          <motion.img
            src={book.coverImage}
            alt={book.title}
            className="card-image"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.3 }}
          />

          {book.discount && (
            <div className="discount-badge">
              <span>-{book.discount}%</span>
            </div>
          )}

          {book.isBestSeller && (
            <div className="bestseller-badge">
              <FiStar size={14} fill="currentColor" />
              <span>Bestseller</span>
            </div>
          )}

          <div className="card-overlay">
            <motion.div
              className="overlay-actions"
              initial={{ opacity: 0, y: 20 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                className="overlay-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  handleWishlist();
                }}
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <FiHeart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
              </motion.button>

              <motion.button
                className="overlay-btn primary"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToCart();
                }}
                title="Add to cart"
              >
                <FiShoppingCart size={20} />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </Link>

      <div className="card-content">
        <div className="card-category">
          {book.category?.name || 'General'}
        </div>

        <Link to={`/books/${book._id}`} className="card-link">
          <h4 className="card-title">{book.title}</h4>
        </Link>

        <Link to={`/authors/${book.author?._id}`} className="card-author">
          {book.author?.name || 'Unknown Author'}
        </Link>

        <div className="card-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                size={14}
                className={i < Math.round(rating) ? 'filled' : ''}
              />
            ))}
          </div>
          <span className="rating-value">{rating.toFixed(1)}</span>
        </div>

        <div className="card-footer">
          <div className="price">
            {book.discount ? (
              <>
                <span className="original-price">₹{book.price}</span>
                <span className="discounted-price">
                  ₹{(book.price * (1 - book.discount / 100)).toFixed(0)}
                </span>
              </>
            ) : (
              <span className="price-value">₹{book.price}</span>
            )}
          </div>

          <motion.button
            className="btn-primary card-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart();
            }}
          >
            <FiShoppingCart size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default PremiumBookCard;
