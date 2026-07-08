import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Anavbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/bookverse');
    };

    return (
        <nav className="navbar navbar-expand-lg px-4 py-3" style={{ backgroundColor: '#5D2E17' }}>
            <span className="navbar-brand text-white fw-bold" style={{ fontSize: '1.4rem' }}>
                BookStore (Admin)
            </span>
            <div className="ms-auto d-flex align-items-center gap-3">
                <NavLink to="/admin/home" className="text-white text-decoration-none fw-semibold px-2">Home</NavLink>
                <NavLink to="/admin/users" className="text-white text-decoration-none fw-semibold px-2">Users</NavLink>
                <NavLink to="/admin/sellers" className="text-white text-decoration-none fw-semibold px-2">Sellers</NavLink>
                <NavLink to="/admin/items" className="text-white text-decoration-none fw-semibold px-2">Items</NavLink>
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

export default Anavbar;
