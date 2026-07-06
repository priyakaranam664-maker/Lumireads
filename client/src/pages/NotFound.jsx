import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiHome } from 'react-icons/fi';

const NotFound = () => (
    <>
        <Helmet><title>404 - BookStore</title></Helmet>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
            <div>
                <div style={{ fontSize: '6rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</div>
                <h2 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Page Not Found</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>The page you're looking for doesn't exist or has been moved.</p>
                <Link to="/" className="btn-primary-custom"><FiHome /> Go Home</Link>
            </div>
        </div>
    </>
);

export default NotFound;
