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

// Lazy loaded pages
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

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminBooks = lazy(() => import('./pages/admin/AdminBooks'));
const AdminBookForm = lazy(() => import('./pages/admin/AdminBookForm'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminAuthors = lazy(() => import('./pages/admin/AdminAuthors'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));

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

                        {/* Admin routes */}
                        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/admin/books" element={<AdminBooks />} />
                            <Route path="/admin/books/new" element={<AdminBookForm />} />
                            <Route path="/admin/books/edit/:id" element={<AdminBookForm />} />
                            <Route path="/admin/categories" element={<AdminCategories />} />
                            <Route path="/admin/authors" element={<AdminAuthors />} />
                            <Route path="/admin/orders" element={<AdminOrders />} />
                            <Route path="/admin/users" element={<AdminUsers />} />
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
