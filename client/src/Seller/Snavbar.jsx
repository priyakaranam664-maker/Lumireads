import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Snavbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/bookverse');
    };

    return (
        <nav className="navbar navbar-expand-lg px-4 py-3" style={{ backgroundColor: '#5D2E17' }}>
            <span className="navbar-brand text-white fw-bold" style={{ fontSize: '1.4rem' }}>
                BookStore (Seller)
            </span>
            <div className="ms-auto d-flex align-items-center gap-3">
                <NavLink to="/seller/home" className="text-white text-decoration-none fw-semibold px-2">Home</NavLink>
                <NavLink to="/seller/products" className="text-white text-decoration-none fw-semibold px-2">My Products</NavLink>
                <NavLink to="/seller/add-book" className="text-white text-decoration-none fw-semibold px-2">Add Books</NavLink>
                <NavLink to="/seller/orders" className="text-white text-decoration-none fw-semibold px-2">Orders</NavLink>
                <button
                    onClick={handleLogout}
                    className="btn btn-sm btn-outline-light ms-2 px-3 fw-bold"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Snavbar;
