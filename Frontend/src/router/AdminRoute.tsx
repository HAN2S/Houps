import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    const isAdmin = localStorage.getItem('adminUser') && localStorage.getItem('adminPass');

    return isAdmin ? <Outlet /> : <Navigate to="/admin/login" />;
};

export default AdminRoute; 