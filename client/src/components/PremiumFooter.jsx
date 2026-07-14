import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiBook, FiFacebook, FiTwitter, FiInstagram, FiLinkedin,
  FiMail, FiPhone, FiMapPin, FiArrowRight
} from 'react-icons/fi';
import '../styles/premium-footer.css';

const PremiumFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Shop',
      links: [
        { label: 'All Books', href: '/books' },
        { label: 'Categories', href: '/categories' },
        { label: 'Authors', href: '/authors' },
        { label: 'Bestsellers', href: '/books?sort=bestseller' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Careers', href: '/careers' },
        { label: 'Press', href: '/press' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact', href: '/contact' },
        { label: 'Help Center', href: '/help' },
        { label: 'Shipping Info', href: '/shipping' },
        { label: 'Returns', href: '/returns' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'Disclaimer', href: '/disclaimer' },
      ],
    },
  ];

  const socialLinks = [
    { icon: FiFacebook, href: '#', label: 'Facebook' },
    { icon: FiTwitter, href: '#', label: 'Twitter' },
    { icon: FiInstagram, href: '#', label: 'Instagram' },
    { icon: FiLinkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="footer-premium">
      {/* Newsletter Section */}
      <motion.div
        className="footer-newsletter"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="container-fluid">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h3 className="newsletter-title">Stay Updated</h3>
              <p className="newsletter-description">
                Get the latest releases and exclusive offers delivered to your inbox.
              </p>
            </div>

            <form className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-btn">
                <FiArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container-fluid">
          {/* Footer Content Grid */}
          <div className="footer-grid">
            {/* Brand Section */}
            <motion.div
              className="footer-brand"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Link to="/" className="footer-logo">
                <FiBook size={24} className="logo-icon" />
                <span>LumiReads</span>
              </Link>
              <p className="brand-description">
                Where Every Story Finds Its Reader.
              </p>
              <p className="brand-description sub-tagline">
                Premium books, fast delivery, best prices.
              </p>

              {/* Social Links */}
              <div className="social-links">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <motion.a
                    key={label}
                    href={href}
                    className="social-link"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title={label}
                  >
                    <Icon size={18} />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Footer Sections */}
            {footerSections.map((section, idx) => (
              <motion.div
                key={idx}
                className="footer-section"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + idx * 0.05 }}
              >
                <h4 className="footer-section-title">{section.title}</h4>
                <ul className="footer-links">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <Link to={link.href} className="footer-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            {/* Contact Section */}
            <motion.div
              className="footer-section"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
            >
              <h4 className="footer-section-title">Contact</h4>
              <div className="contact-items">
                <a href="mailto:support@lumireads.com" className="contact-item">
                  <FiMail size={16} />
                  <span>support@lumireads.com</span>
                </a>
                <a href="tel:+1234567890" className="contact-item">
                  <FiPhone size={16} />
                  <span>+1 (234) 567-8900</span>
                </a>
                <div className="contact-item">
                  <FiMapPin size={16} />
                  <span>123 Book Street, Reading City, RC 12345</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Bottom */}
          <motion.div
            className="footer-bottom"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <p className="copyright">
              &copy; {currentYear} LumiReads. All rights reserved.
            </p>
            <div className="footer-badges">
              <div className="badge-item">Secure Payment</div>
              <div className="badge-item">Fast Shipping</div>
              <div className="badge-item">Money Back Guarantee</div>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default PremiumFooter;
