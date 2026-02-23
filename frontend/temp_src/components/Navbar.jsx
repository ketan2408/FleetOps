import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{ backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1rem 0' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem' }}>
                    <Car /> FleetOps
                </Link>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <Link to="/items" style={{ textDecoration: 'none', color: 'var(--text)' }}>Browse Items</Link>
                            <Link to={`/${user.role.toLowerCase()}`} style={{ textDecoration: 'none', color: 'var(--text)' }}>Dashboard</Link>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <UserIcon size={18} />
                                <span>{user.name} ({user.role})</span>
                            </div>
                            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', backgroundColor: 'var(--error)', color: '#fff', cursor: 'pointer' }}>
                                <LogOut size={16} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text)' }}>Login</Link>
                            <Link to="/register" style={{ textDecoration: 'none', color: '#fff', backgroundColor: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '4px' }}>Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
