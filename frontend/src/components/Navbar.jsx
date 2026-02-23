import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    return (
        <nav style={{ backgroundColor: 'var(--nav-bg)', boxShadow: 'var(--shadow)', padding: '1rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem' }}>
                    <Car size={28} /> FleetOps
                </Link>

                {/* Desktop Menu */}
                <div className="desktop-menu" style={{ display: 'flex', gap: '2rem', alignItems: 'center', flex: 1, marginLeft: '2rem' }}>
                    <Link to="/" style={{ textDecoration: 'none', color: 'var(--secondary)', fontWeight: '500' }}>Home</Link>
                    {user && (
                        <>
                            <Link to={`/${user.role.toLowerCase()}`} style={{ textDecoration: 'none', color: 'var(--secondary)', fontWeight: '500' }}>Dashboard</Link>
                        </>
                    )}
                </div>

                {/* Auth Section */}
                <div className="auth-section" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ThemeToggle />
                    {user ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                <UserIcon size={16} />
                                <span>{user.name}</span>
                                <span style={{ background: 'var(--light)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    {user.role}
                                </span>
                            </div>
                            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', border: 'none', borderRadius: 'var(--radius)', backgroundColor: 'var(--danger)', color: 'white', cursor: 'pointer', fontSize: '0.875rem' }}>
                                <LogOut size={16} />
                                <span className="logout-text">Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                Register
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div style={{ padding: '1rem 20px', borderTop: '1px solid var(--border)', display: 'none' }} className="mobile-menu">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--secondary)' }}>Home</Link>
                        {user && (
                            <>
                                <Link to={`/${user.role.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--secondary)' }}>Dashboard</Link>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .desktop-menu { display: none !important; }
                    .mobile-menu-toggle { display: block !important; }
                    .mobile-menu { display: block !important; }
                    .logout-text { display: none; }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
