import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        console.log('ProtectedRoute: No user found, redirecting to home');
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    console.log(`ProtectedRoute: User role: ${user.role}, Allowed roles: ${roles}`);

    if (roles && !roles.includes(user.role)) {
        console.log('ProtectedRoute: Role mismatch, redirecting to home');
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
