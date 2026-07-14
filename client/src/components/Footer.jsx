import { Link } from 'react-router-dom';
import { FiBookOpen, FiInstagram, FiFacebook, FiTwitter, FiMail, FiArrowRight } from 'react-icons/fi';

const Footer = () => {
    const usefulLinks = [
        { label: 'Home', href: '/' },
        { label: 'Books', href: '/books' },
        { label: 'Authors', href: '/authors' },
        { label: 'Categories', href: '/categories' },
        { label: 'Contact', href: '/contact' },
    ];

    return (
        <footer className="footer-shell" aria-label="Site footer">
            <div className="container">
                <div className="footer-grid-modern">
                    <div className="footer-brand-block">
                        <div className="footer-brand-mark">
                            <FiBookOpen size={18} />
                        </div>
                        <h4>LumiReads</h4>
                        <p>Curated books, thoughtful stories, and a calm reading experience for every kind of reader.</p>
                        <div className="footer-socials">
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><FiInstagram /></a>
                            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FiFacebook /></a>
                            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><FiTwitter /></a>
                            <a href="mailto:hello@lumireads.com" aria-label="Email"><FiMail /></a>
                        </div>
                    </div>

                    <div className="footer-links-block">
                        <h5>Useful Links</h5>
                        <ul>
                            {usefulLinks.map((link) => (
                                <li key={link.href}><Link to={link.href}>{link.label}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-quote-block">
                        <h5>Reading Note</h5>
                        <p>“A room without books is like a body without a soul.”</p>
                        <div className="footer-newsletter">
                            <input type="email" placeholder="Join our newsletter" />
                            <button type="button"><FiArrowRight /></button>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom-modern">
                    <span>© {new Date().getFullYear()} LumiReads</span>
                    <span>Made for readers who love thoughtful discovery.</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
