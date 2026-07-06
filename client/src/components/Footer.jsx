import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => (
    <footer className="footer">
        <Container>
            <Row className="g-4">
                <Col lg={4} md={6}>
                    <div className="footer-brand">📚 BookStore</div>
                    <p className="footer-desc">Your premium destination for books. Discover bestsellers, new releases, and curated collections from world-renowned authors.</p>
                    <div className="d-flex gap-2 mt-3">
                        {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, i) => (
                            <a key={i} href="#" className="btn-icon"><Icon size={14} /></a>
                        ))}
                    </div>
                </Col>
                <Col lg={2} md={6}>
                    <div className="footer-title">Quick Links</div>
                    <Link to="/" className="footer-link">Home</Link>
                    <Link to="/books" className="footer-link">All Books</Link>
                    <Link to="/categories" className="footer-link">Categories</Link>
                    <Link to="/authors" className="footer-link">Authors</Link>
                    <Link to="/books?isBestSeller=true" className="footer-link">Best Sellers</Link>
                    <Link to="/books?isNewArrival=true" className="footer-link">New Arrivals</Link>
                </Col>
                <Col lg={2} md={6}>
                    <div className="footer-title">Customer</div>
                    <Link to="/dashboard" className="footer-link">My Account</Link>
                    <Link to="/orders" className="footer-link">Order History</Link>
                    <Link to="/wishlist" className="footer-link">Wishlist</Link>
                    <Link to="/cart" className="footer-link">Shopping Cart</Link>
                    <Link to="/contact" className="footer-link">Contact Us</Link>
                    <Link to="/about" className="footer-link">About Us</Link>
                </Col>
                <Col lg={4} md={6}>
                    <div className="footer-title">Contact Info</div>
                    <div className="d-flex align-items-start gap-2 mb-2">
                        <FiMapPin style={{ color: 'var(--primary)', marginTop: '3px', flexShrink: 0 }} />
                        <span className="footer-desc" style={{ marginBottom: 0 }}>123 Book Street, Literary District, Mumbai, India - 400001</span>
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <FiPhone style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span className="footer-desc" style={{ marginBottom: 0 }}>+91 98765 43210</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <FiMail style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span className="footer-desc" style={{ marginBottom: 0 }}>support@bookstore.com</span>
                    </div>
                </Col>
            </Row>
            <div className="footer-bottom text-center">
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 0 }}>
                    © {new Date().getFullYear()} BookStore. All rights reserved. Made with ❤️ for book lovers.
                </p>
            </div>
        </Container>
    </footer>
);

export default Footer;
