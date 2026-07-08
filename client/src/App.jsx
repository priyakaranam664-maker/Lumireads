import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import LoadingSpinner from './components/LoadingSpinner';
import SocialAuthHandler from './components/SocialAuthHandler';
import BackToTop, { ScrollToTopOnNavigate } from './components/BackToTop';
import ErrorBoundary from './components/ErrorBoundary';

// ====== Existing Pages (lazy loaded) ======
const Home = lazy(() => import('./pages/Home'));
const Books = lazy(() => import('./pages/Books'));
const BookDetail = lazy(() => import('./pages/BookDetail'));
const Categories = lazy(() => import('./pages/Categories'));
const Authors = lazy(() => import('./pages/Authors'));
const AuthorDetail = lazy(() => import('./pages/AuthorDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Profile = lazy(() => import('./pages/Profile'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Existing Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminBooks = lazy(() => import('./pages/admin/AdminBooks'));
const AdminBookForm = lazy(() => import('./pages/admin/AdminBookForm'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminAuthors = lazy(() => import('./pages/admin/AdminAuthors'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));

// ====== BookVerse Pages ======
// Components
const BookVerseHome = lazy(() => import('./Components/Home'));

// Admin (BookVerse)
const Alogin = lazy(() => import('./Admin/Alogin'));
const Asignup = lazy(() => import('./Admin/Asignup'));
const Ahome = lazy(() => import('./Admin/Ahome'));
const AdminItemsBV = lazy(() => import('./Admin/items'));
const AdminUsersBV = lazy(() => import('./Admin/Users'));
const AdminSellerBV = lazy(() => import('./Admin/Seller'));

// Seller (BookVerse)
const Slogin = lazy(() => import('./Seller/Slogin'));
const Ssignup = lazy(() => import('./Seller/Ssignup'));
const Shome = lazy(() => import('./Seller/Shome'));
const SellerMyProducts = lazy(() => import('./Seller/MyProducts'));
const SellerAddbook = lazy(() => import('./Seller/Addbook'));
const SellerBook = lazy(() => import('./Seller/Book'));
const SellerOrders = lazy(() => import('./Seller/Orders'));

// User (BookVerse)
const UserLogin = lazy(() => import('./User/Login'));
const UserSignup = lazy(() => import('./User/Signup'));
const Uhome = lazy(() => import('./User/Uhome'));
const UserProducts = lazy(() => import('./User/Products'));
const Uitem = lazy(() => import('./User/Uitem'));
const UserMyOrders = lazy(() => import('./User/MyOrders'));
const UserOrderItem = lazy(() => import('./User/OrderItem'));

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <LoadingSpinner />;
    return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const { isAdmin, loading } = useAuth();
    if (loading) return <LoadingSpinner />;
    return isAdmin ? children : <Navigate to="/" />;
};

const GuestRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <LoadingSpinner />;
    return !isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
    return (
        <>
            <ScrollToTopOnNavigate />
            <SocialAuthHandler />
            <BackToTop />
            <Toaster position="top-right" toastOptions={{
                duration: 3000,
                style: { borderRadius: '10px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' },
            }} />
            <Suspense fallback={<LoadingSpinner />}>
                <ErrorBoundary>
                    <Routes>
                        {/* ====== BookVerse Role-Based Routes ====== */}
                        <Route path="/bookverse" element={<BookVerseHome />} />

                        {/* Admin (BookVerse) */}
                        <Route path="/admin/login" element={<Alogin />} />
                        <Route path="/admin/signup" element={<Asignup />} />
                        <Route path="/admin/home" element={<Ahome />} />
                        <Route path="/admin/items" element={<AdminItemsBV />} />
                        <Route path="/admin/users" element={<AdminUsersBV />} />
                        <Route path="/admin/sellers" element={<AdminSellerBV />} />

                        {/* Seller (BookVerse) */}
                        <Route path="/seller/login" element={<Slogin />} />
                        <Route path="/seller/signup" element={<Ssignup />} />
                        <Route path="/seller/home" element={<Shome />} />
                        <Route path="/seller/products" element={<SellerMyProducts />} />
                        <Route path="/seller/add-book" element={<SellerAddbook />} />
                        <Route path="/seller/book/:id" element={<SellerBook />} />
                        <Route path="/seller/orders" element={<SellerOrders />} />

                        {/* User (BookVerse) */}
                        <Route path="/user/login" element={<UserLogin />} />
                        <Route path="/user/signup" element={<UserSignup />} />
                        <Route path="/user/home" element={<Uhome />} />
                        <Route path="/user/products" element={<UserProducts />} />
                        <Route path="/user/item/:identifier" element={<Uitem />} />
                        <Route path="/user/orders" element={<UserMyOrders />} />
                        <Route path="/user/order/:id" element={<UserOrderItem />} />

                        {/* ====== Original BookStore Routes ====== */}
                        {/* Public routes */}
                        <Route element={<MainLayout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/books" element={<Books />} />
                            <Route path="/books/:identifier" element={<BookDetail />} />
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/authors" element={<Authors />} />
                            <Route path="/authors/:identifier" element={<AuthorDetail />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />

                            {/* Auth routes */}
                            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
                            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />

                            {/* Protected routes */}
                            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        </Route>

                        {/* Original admin routes */}
                        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/admin/books" element={<AdminBooks />} />
                            <Route path="/admin/books/new" element={<AdminBookForm />} />
                            <Route path="/admin/books/edit/:id" element={<AdminBookForm />} />
                            <Route path="/admin/categories" element={<AdminCategories />} />
                            <Route path="/admin/authors" element={<AdminAuthors />} />
                            <Route path="/admin/orders" element={<AdminOrders />} />
                            <Route path="/admin/users-manage" element={<AdminUsers />} />
                            <Route path="/admin/coupons" element={<AdminCoupons />} />
                        </Route>

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </ErrorBoundary>
            </Suspense>
        </>
    );
}

export default App;
