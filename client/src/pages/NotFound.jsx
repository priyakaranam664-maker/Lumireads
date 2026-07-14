import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiHome, FiCompass } from 'react-icons/fi';

const NotFound = () => (
    <>
        <Helmet><title>404 - BookStore</title></Helmet>
        <div className="empty-state-page">
            <div className="empty-state-card">
                <div className="empty-state-illustration">
                    <FiCompass size={44} />
                </div>
                <div className="not-found-code">404</div>
                <h2>We lost this page in the stacks.</h2>
                <p>The page you’re looking for doesn’t exist or has been moved. Let’s get you back to discovering books.</p>
                <Link to="/" className="btn-primary-custom"><FiHome /> Back to Home</Link>
            </div>
        </div>
    </>
);

export default NotFound;
