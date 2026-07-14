import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.css';
// Premium Design System
import './styles/premium-design.css';
import './styles/premium-navbar.css';
import './styles/premium-book-card.css';
import './styles/premium-home.css';
import './styles/premium-footer.css';
import './styles/book-detail-premium.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HelmetProvider>
            <BrowserRouter>
                <ThemeProvider>
                    <AuthProvider>
                        <CartProvider>
                            <App />
                        </CartProvider>
                    </AuthProvider>
                </ThemeProvider>
            </BrowserRouter>
        </HelmetProvider>
    </React.StrictMode>
);
