import React from 'react';

const Footer = () => {
    return (
        <footer className="py-4 text-center mt-5" style={{ backgroundColor: '#5D2E17', color: '#f8f9fa' }}>
            <div className="container">
                <p className="mb-1 fw-bold">📚 BookVerse Bookstore Platform</p>
                <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
                    © {new Date().getFullYear()} BookVerse. All rights reserved. Built with love on MongoDB, Express, React, and Node.js.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
