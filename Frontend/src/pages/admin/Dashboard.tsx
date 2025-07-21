import React, { useEffect, useState } from 'react';
import '../styles/AdminPanel.css';
import '../styles/Buttons.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalQuestions: 0,
        totalCategories: 0,
        activeSessions: 0
    });

    useEffect(() => {
        fetch('http://localhost:8081/api/admin/stats', {
            headers: {
                'Authorization': 'Basic ' + btoa(`${localStorage.getItem('adminUser')}:${localStorage.getItem('adminPass')}`)
            }
        })
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(() => setStats({ totalQuestions: 0, totalCategories: 0, activeSessions: 0 }));
    }, []);

    return (
        <div className="admin-card">
            <h1>Admin Dashboard</h1>
            <p>Welcome to the admin panel. Here is a quick overview of your game:</p>
            
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem'}}>
                <div className="stat-card">
                    <h3>Total Questions</h3>
                    <p>{stats.totalQuestions}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Categories</h3>
                    <p>{stats.totalCategories}</p>
                </div>
                <div className="stat-card">
                    <h3>Active Sessions</h3>
                    <p>{stats.activeSessions}</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 