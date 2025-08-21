import React,{useState} from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { FaTimes, FaBars } from 'react-icons/fa';
import '../styles/AdminPanel.css';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Starts closed

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <nav className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="admin-sidebar-toggle-wrapper">
                    <button
                        className="admin-sidebar-toggle"
                        onClick={toggleSidebar}
                        aria-label={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
                        title={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
                    >
                        {isSidebarOpen ? <FaTimes size={20} color="#E1EEBC" /> : <FaBars size={24} color="#E1EEBC" />}
                    </button>
                </div>
                {isSidebarOpen && (
                    <div className="admin-sidebar-header">
                        <h2 className="admin-sidebar-title">Admin Panel</h2>
                    </div>
                )}
                <ul className={`admin-sidebar-menu ${isSidebarOpen ? 'visible' : 'hidden'}`}>
                    <li><NavLink to="/admin/dashboard" className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`} onClick={toggleSidebar}>Dashboard</NavLink></li>
                    <li><NavLink to="/admin/categories" className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`} onClick={toggleSidebar}>Manage Categories</NavLink></li>
                    <li><NavLink to="/admin/questions" className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`} onClick={toggleSidebar}>Manage Questions</NavLink></li>
                </ul>
            </nav>

            {/* Overlay for small screens when sidebar open */}
            {isSidebarOpen && (
                <div className="admin-sidebar-overlay" onClick={toggleSidebar} />
            )}

            {/* Main Content */}
            <main className={`admin-main ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout; 