import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import '../styles/AdminPanel.css';

const AdminLayout = () => (
    <div className="admin-layout">
        <nav className="admin-sidebar">
            <h2>Admin Panel</h2>
            <ul>
                <li><NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink></li>
                <li><NavLink to="/admin/categories" className={({ isActive }) => isActive ? 'active' : ''}>Manage Categories</NavLink></li>
                <li><NavLink to="/admin/questions" className={({ isActive }) => isActive ? 'active' : ''}>Manage Questions</NavLink></li>
            </ul>
        </nav>
        <main className="admin-main">
            <Outlet />
        </main>
    </div>
);

export default AdminLayout; 