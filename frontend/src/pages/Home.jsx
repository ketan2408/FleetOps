import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { Truck, Wrench, Users, TrendingUp, Shield, Zap, ArrowRight, LogOut, X } from 'lucide-react';
import Login from './Login';
import Register from './Register';
import Navbar from '../components/Navbar';
import bgImage from '../images/feature-1.jpg';

const Home = ({ authMode }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const [stats, setStats] = React.useState({
        totalUsers: 0,
        totalVendors: 0,
        totalOrders: 0,
        totalRevenue: 0
    });

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/public/stats');
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            }
        };
        fetchStats();
    }, []);

    const getDashboardPath = () => {
        if (!user) return '/login';
        return `/${user.role.toLowerCase()}`;
    };

    return (
        <div className="dashboard-bg">
            <div className="dashboard-visual-bg" style={{ backgroundImage: `url(${bgImage})` }}>
                <div className="glass-overlay"></div>
            </div>
            <Navbar />
            {/* Hero Section */}
            <section className="hero-bg" style={{ 
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1519003722824-192d9978736b?auto=format&fit=crop&q=80&w=1200")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                padding: '6rem 2rem'
            }}>
                <div className="hero-inner container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        🚗 FleetOps
                    </h1>
                    <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.95 }}>
                        Your Complete Fleet Management & Vehicle Service Platform
                    </p>
                    <p style={{ fontSize: '1rem', marginBottom: '2rem', opacity: 0.9 }}>
                        Connect with vendors, manage orders, track services, and keep your fleet running smoothly.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {user ? (
                            <button onClick={() => navigate(getDashboardPath())} className="btn btn-secondary" style={{ backgroundColor: '#fff', color: 'var(--primary)', fontWeight: 'bold', padding: '0.75rem 2rem' }}>
                                Go to Dashboard
                            </button>
                        ) : (
                            <>
                                <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ backgroundColor: '#fff', color: 'var(--primary)', fontWeight: 'bold', padding: '0.75rem 2rem' }}>
                                    Login Now
                                </button>
                                <button onClick={() => navigate('/register')} className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff', fontWeight: 'bold', padding: '0.75rem 2rem' }}>
                                    Create Account
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section style={{ padding: '5rem 2rem', background: 'rgba(255,255,255,0.02)' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff', marginBottom: '1rem' }}>
                            Advanced Fleet Solutions
                        </h2>
                        <div style={{ width: '80px', height: '4px', background: 'var(--primary)', margin: '0 auto', borderRadius: '2px' }}></div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
                        {/* Feature 1 */}
                        <div className="feature-card">
                            <img src="https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62?auto=format&fit=crop&q=80&w=800" alt="Fleet Management" className="feature-img" />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Fleet Management</h3>
                            <p style={{ color: 'var(--secondary)', lineHeight: '1.6' }}>
                                Manage all your vehicles and services in one centralized dashboard. Track status, maintenance, and orders effortlessly.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="feature-card">
                            <img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=800" alt="Professional Services" className="feature-img" />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Professional Services</h3>
                            <p style={{ color: 'var(--secondary)', lineHeight: '1.6' }}>
                                Access verified vendors offering maintenance, repair, and service solutions for your fleet.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="feature-card">
                            <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800" alt="Vendor Network" className="feature-img" />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Vendor Network</h3>
                            <p style={{ color: 'var(--secondary)', lineHeight: '1.6' }}>
                                Connect with certified vendors and manage all your service needs from a single platform.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="feature-card">
                            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" alt="Analytics" className="feature-img" />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Real-time Analytics</h3>
                            <p style={{ color: 'var(--secondary)', lineHeight: '1.6' }}>
                                Get insights into spending, order history, vendor performance, and fleet statistics.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="feature-card">
                            <img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=800" alt="Secure Payments" className="feature-img" />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Secure Payments</h3>
                            <p style={{ color: 'var(--secondary)', lineHeight: '1.6' }}>
                                Safe and secure payment processing with multiple payment methods supported.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="feature-card">
                            <img src="https://images.unsplash.com/photo-1590674899484-13da0d1b58f5?auto=format&fit=crop&q=80&w=800" alt="Fast & Reliable" className="feature-img" />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Fast & Reliable</h3>
                            <p style={{ color: 'var(--secondary)', lineHeight: '1.6' }}>
                                Lightning-fast performance and 99.9% uptime ensures your fleet operations never stop.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* User Roles Section */}
            <section style={{ padding: '4rem 2rem', background: 'rgba(255,255,255,0.05)' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>
                        Different Experience for Everyone
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {/* Fleet Operator */}
                        <div className="card" style={{ borderLeft: '4px solid var(--primary)', transition: 'all 0.3s' }}>
                            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>🚗 Fleet Operators</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>✓ Browse & book services instantly</li>
                                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>✓ Track all orders & payments</li>
                                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>✓ View order history & invoices</li>
                                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>✓ Rate vendors & write reviews</li>
                                <li style={{ padding: '0.5rem 0' }}>✓ Manage payment methods securely</li>
                            </ul>
                        </div>

                        {/* Vendors */}
                        <div className="card" style={{ borderLeft: '4px solid var(--success)', transition: 'all 0.3s' }}>
                            <h3 style={{ color: 'var(--success)', marginBottom: '1rem' }}>🔧 Vendors</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>✓ List your services & pricing</li>
                                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>✓ Manage incoming orders</li>
                                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>✓ Track revenue & earnings</li>
                                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>✓ Update order statuses</li>
                                <li style={{ padding: '0.5rem 0' }}>✓ Build your reputation</li>
                            </ul>
                        </div>

                        {/* Admin */}
                        <div className="card" style={{ borderLeft: '4px solid var(--warning)', transition: 'all 0.3s' }}>
                            <h3 style={{ color: 'var(--warning)', marginBottom: '1rem' }}>⚙️ Administrators</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>✓ Manage all users & vendors</li>
                                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>✓ View system statistics</li>
                                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>✓ Approve/reject vendors</li>
                                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>✓ Monitor platform activity</li>
                                <li style={{ padding: '0.5rem 0' }}>✓ Manage user accounts</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section style={{ padding: '4rem 2rem', background: 'transparent' }}>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>
                        How It Works
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'var(--primary)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                margin: '0 auto 1rem'
                            }}>1</div>
                            <h3>Create Account</h3>
                            <p style={{ color: 'var(--secondary)' }}>Sign up as a fleet operator or vendor</p>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'var(--primary)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                margin: '0 auto 1rem'
                            }}>2</div>
                            <h3>Browse Services</h3>
                            <p style={{ color: 'var(--secondary)' }}>Explore available vendors and services</p>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'var(--primary)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                margin: '0 auto 1rem'
                            }}>3</div>
                            <h3>Place Order</h3>
                            <p style={{ color: 'var(--secondary)' }}>Request service from your vendor</p>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'var(--primary)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                margin: '0 auto 1rem'
                            }}>4</div>
                            <h3>Track Progress</h3>
                            <p style={{ color: 'var(--secondary)' }}>Monitor order progress in real-time</p>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'var(--primary)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                margin: '0 auto 1rem'
                            }}>5</div>
                            <h3>Pay Securely</h3>
                            <p style={{ color: 'var(--secondary)' }}>Complete payment with multiple options</p>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'var(--primary)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                margin: '0 auto 1rem'
                            }}>6</div>
                            <h3>Rate & Review</h3>
                            <p style={{ color: 'var(--secondary)' }}>Share feedback and build trust</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section style={{ padding: '4rem 2rem', background: 'rgba(255,255,255,0.05)' }}>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>
                        Trusted by Thousands
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
                        <div>
                            <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>{stats.totalUsers}+</p>
                            <p style={{ color: 'var(--secondary)', marginTop: '0.5rem' }}>Active Users</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--success)', margin: 0 }}>{stats.totalVendors}+</p>
                            <p style={{ color: 'var(--secondary)', marginTop: '0.5rem' }}>Verified Vendors</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--warning)', margin: 0 }}>{stats.totalOrders}+</p>
                            <p style={{ color: 'var(--secondary)', marginTop: '0.5rem' }}>Orders Completed</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--danger)', margin: 0 }}>${(stats.totalRevenue / 1000).toFixed(0)}K+</p>
                            <p style={{ color: 'var(--secondary)', marginTop: '0.5rem' }}>In Transactions</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, #667eea 100%)',
                color: 'white',
                padding: '4rem 2rem',
                textAlign: 'center'
            }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '1rem', fontSize: '2rem', fontWeight: 'bold' }}>
                        Ready to Get Started?
                    </h2>
                    <p style={{ marginBottom: '2rem', fontSize: '1.1rem', opacity: 0.95 }}>
                        Join thousands of fleet operators and vendors already using FleetOps to streamline their operations.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {user ? (
                            <button onClick={() => navigate(getDashboardPath())} className="btn" style={{ backgroundColor: '#fff', color: 'var(--primary)', fontWeight: 'bold', padding: '0.75rem 2rem', cursor: 'pointer', border: 'none', borderRadius: 'var(--radius)' }}>
                                Back to My Dashboard
                                <ArrowRight size={20} style={{ marginLeft: '0.5rem', display: 'inline' }} />
                            </button>
                        ) : (
                            <>
                                <button onClick={() => navigate('/register')} className="btn" style={{ backgroundColor: '#fff', color: 'var(--primary)', fontWeight: 'bold', padding: '0.75rem 2rem', cursor: 'pointer', border: 'none', borderRadius: 'var(--radius)' }}>
                                    Create Free Account
                                    <ArrowRight size={20} style={{ marginLeft: '0.5rem', display: 'inline' }} />
                                </button>
                                <button onClick={() => navigate('/login')} className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff', fontWeight: 'bold', padding: '0.75rem 2rem' }}>
                                    Login to Account
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: '#1a1a1a', color: '#fff', padding: '2rem', textAlign: 'center' }}>
                <p style={{ margin: 0 }}>&copy; 2026 FleetOps . Build by Ketan Patil</p>
            </footer>

            {/* Auth Modals */}
            {authMode && (
                <div className="modal-overlay" onClick={() => navigate('/')}>
                    <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                        <button 
                            onClick={() => navigate('/')}
                            style={{ 
                                position: 'absolute', 
                                top: '1rem', 
                                right: '1rem', 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer',
                                color: 'var(--secondary)',
                                zIndex: 10
                            }}
                        >
                            <X size={24} />
                        </button>
                        <div style={{ padding: '1rem' }}>
                            {authMode === 'login' ? <Login isModal={true} /> : <Register isModal={true} />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
