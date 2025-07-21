import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminPanel.css';
import '../styles/Buttons.css';
import '../styles/Home.css';

const AdminLogin = () => {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'admin') {
            localStorage.setItem('adminUser', username);
            localStorage.setItem('adminPass', password);
            navigate('/admin/dashboard');
        } else {
            alert('Invalid credentials');
        }
    };

    return (
        <div className="admin-login-page">
            <div className="login-card">
                <h3>Admin Login</h3>
                <p>Welcome back! Please log in to your account.</p>
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="login-btn">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin; 