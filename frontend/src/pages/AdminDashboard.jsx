import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import Alert from '../components/Alert';
import ItemListingNew from './ItemListingNew';
import { Users, Store, ShieldCheck, XCircle, LogOut, TrendingUp, BarChart3, CheckCircle, AlertCircle, Home, Car, Package, Search, CreditCard, Calendar, Plus, Edit, Trash2, FileText, Eye } from 'lucide-react';
import bgImage from '../images/feature-1.jpg';


const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [users, setUsers] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [planForm, setPlanForm] = useState({ name: '', description: '', price: '', durationDays: '', features: '' });
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [selectedReviewVendor, setSelectedReviewVendor] = useState(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleUpdateSubscription = async (vendorId, subscriptionData) => {
        setIsProcessing(true);
        setError('');
        setSuccess('');
        try {
            await api.put(`/auth/vendors/${vendorId}/subscription`, subscriptionData);
            setSuccess('Vendor subscription updated successfully');
            fetchDashboardData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update subscription');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleApproveVendor = async (vendorId) => {
        setIsProcessing(true);
        setError('');
        setSuccess('');
        try {
            await api.put(`/auth/vendors/${vendorId}/approve`);
            setSuccess('Vendor approved successfully');
            fetchDashboardData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to approve vendor');
        } finally {
            setIsProcessing(false);
        }
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [usersRes, vendorsRes, statsRes, ordersRes, plansRes, subsRes] = await Promise.all([
                api.get('/auth/users?role=USER'),
                api.get('/auth/vendors'),
                api.get('/orders/stats/overview').catch(() => ({})),
                api.get('/orders?limit=100').catch(() => ({})),
                api.get('/plans'),
                api.get('/subscriptions')
            ]);
            console.log('Admin: Fetched Users:', usersRes.data?.users?.length);
            console.log('Admin: Fetched Vendors:', vendorsRes.data?.vendors?.length);
            console.log('Admin: Fetched Orders:', ordersRes.data?.orders?.length || ordersRes.data?.length);
            console.log('Admin: Fetched Plans:', plansRes.data?.length);
            console.log('Admin: Fetched Subscriptions:', subsRes.data?.length);

            setUsers(usersRes.data.users || []);
            setVendors(vendorsRes.data.vendors || []);
            setOrders(ordersRes.data?.orders || ordersRes.data || []);
            setPlans(plansRes.data || []);
            setSubscriptions(subsRes.data || []);
            if (statsRes.data) {
                setStats(statsRes.data);
            }
        } catch (error) {
            setError('Failed to fetch admin data');
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePlan = async (e) => {
        if (e) e.preventDefault();
        
        // Basic Validation
        if (!planForm.name || !planForm.price || !planForm.durationDays) {
            setError('Please fill in all required fields');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsProcessing(true);
        setError('');
        
        try {
            const payload = {
                name: planForm.name.trim(),
                description: planForm.description || `Subscription plan for ${planForm.name}`,
                price: parseFloat(planForm.price),
                durationDays: parseInt(planForm.durationDays),
                features: typeof planForm.features === 'string' 
                    ? planForm.features.split(',').map(f => f.trim()).filter(f => f) 
                    : (Array.isArray(planForm.features) ? planForm.features : [])
            };

            // Nano-second validation for numbers
            if (isNaN(payload.price) || isNaN(payload.durationDays)) {
                throw new Error('Price and Duration must be valid numbers');
            }

            console.log('Frontend: Sending plan payload:', payload);
            
            if (editingPlan) {
                const res = await api.put(`/plans/${editingPlan._id}`, payload);
                console.log('Frontend: Update success:', res.data);
                setSuccess('Plan updated successfully');
            } else {
                const res = await api.post('/plans', payload);
                console.log('Frontend: Create success:', res.data);
                setSuccess('Plan created successfully');
            }
            
            setShowPlanModal(false);
            setEditingPlan(null);
            setPlanForm({ name: '', description: '', price: '', durationDays: '', features: '' });
            fetchDashboardData();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error('Frontend: Save plan failure:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to save plan';
            setError(msg);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleTogglePlan = async (id) => {
        try {
            await api.delete(`/plans/${id}`);
            fetchDashboardData();
        } catch (err) {
            setError('Failed to toggle plan status');
        }
    };

    const getStats = () => ({
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        totalVendors: vendors.length,
        approvedVendors: vendors.filter(v => v.approved).length,
        subscribedVendors: vendors.filter(v => v.isSubscribed).length
    });

    const dashboardStats = getStats();

    return (
        <div className="dashboard-bg">

            <div className="dash-layout">
            <aside className="dash-sidebar">
                <div className="dash-sidebar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', marginBottom: '2rem' }}>
                        <Car size={32} />
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>FleetOps</span>
                    </div>
                </div>
                
                <div className="dash-sidebar-links">
                    <button 
                        className={`dash-sidebar-btn ${activeTab === 'overview' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('overview')}
                    >
                        <Home size={20} /> <span>Home</span>
                    </button>
                    <button 
                        className={`dash-sidebar-btn ${activeTab === 'marketplace' ? 'active' : ''}`}
                        onClick={() => setActiveTab('marketplace')}
                    >
                        <Search size={20} /> <span>Marketplace</span>
                    </button>
                    <div style={{ margin: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
                    <button 
                        className={`dash-sidebar-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <TrendingUp size={20} /> <span>Overview</span>
                    </button>
                    <button 
                        className={`dash-sidebar-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users size={20} /> <span>User Database</span>
                    </button>
                    <button 
                        className={`dash-sidebar-btn ${activeTab === 'vendors' ? 'active' : ''}`}
                        onClick={() => setActiveTab('vendors')}
                    >
                        <Store size={20} /> <span>Vendor Database</span>
                    </button>
                    <button 
                        className={`dash-sidebar-btn ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <Package size={20} /> <span>Transaction Database</span>
                    </button>
                    <button 
                        className={`dash-sidebar-btn ${activeTab === 'plans' ? 'active' : ''}`}
                        onClick={() => setActiveTab('plans')}
                    >
                        <CreditCard size={20} /> <span>Managed Plans</span>
                    </button>
                </div>

                <div className="dash-sidebar-footer">
                    <div style={{ padding: '0 0.5rem 1rem 0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ 
                                width: '36px', 
                                height: '36px', 
                                borderRadius: '50%', 
                                backgroundColor: 'var(--primary)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold'
                            }}>
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name}</p>
                                <span style={{ 
                                    fontSize: '0.75rem', 
                                    color: 'var(--primary)', 
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                                    padding: '0.1rem 0.4rem', 
                                    borderRadius: '4px',
                                    fontWeight: '500'
                                }}>
                                    {user?.role}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="dash-sidebar-btn" style={{ color: '#ef4444', width: '100%' }}>
                        <LogOut size={20} /> <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="dash-main">
                <div className="dashboard-visual-bg" style={{ backgroundImage: `url(${bgImage})` }}>
                    <div className="glass-overlay"></div>
                </div>

                
                <div className="dash-content-relative">
                    {error && <Alert type="error" message={error} onClose={() => setError('')} />}
                    {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

                <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.75rem' }}>System Dashboard</h1>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--primary)', fontWeight: 'bold', letterSpacing: '1px', fontSize: '0.8rem' }}>🛰️ CENTRAL DATA COMMAND CENTER</p>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8' }}>Monitor and manage cross-platform databases</p>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#4b5563', textAlign: 'right', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '8px' }}>
                        <div>Role: {user?.role}</div>
                        <div>API: {api.defaults.baseURL}</div>
                        <div>Token: {localStorage.getItem('token') ? 'Yes' : 'No'}</div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
                    <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Total Users</p>
                                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{dashboardStats.totalUsers}</p>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#10b981' }}>{dashboardStats.activeUsers} active</p>
                            </div>
                            <Users size={32} style={{ color: 'var(--primary)', opacity: 0.5 }} />
                        </div>
                    </div>

                    <div className="card" style={{ borderLeft: '4px solid var(--success)', background: 'var(--dark-card)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Total Vendors</p>
                                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{dashboardStats.totalVendors}</p>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#10b981' }}>{dashboardStats.approvedVendors} approved</p>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#3b82f6' }}>{dashboardStats.subscribedVendors} subscribed</p>
                                </div>
                            </div>
                            <Store size={32} style={{ color: 'var(--success)', opacity: 0.5 }} />
                        </div>
                    </div>

                    {stats && (
                        <>
                            <div className="card" style={{ borderLeft: '4px solid #f59e0b', background: 'var(--dark-card)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Total Orders</p>
                                        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalOrders || 0}</p>
                                    </div>
                                    <BarChart3 size={32} style={{ color: '#f59e0b', opacity: 0.5 }} />
                                </div>
                            </div>

                            <div className="card" style={{ borderLeft: '4px solid var(--primary)', background: 'var(--dark-card)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Revenue</p>
                                        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>${(stats.totalRevenue || 0).toFixed(2)}</p>
                                    </div>
                                    <TrendingUp size={32} style={{ color: 'var(--primary)', opacity: 0.5 }} />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="card" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '2rem' }}>System Performance Overview</h2>
                        {loading ? (
                            <p style={{ textAlign: 'center', color: '#94a3b8' }}>Loading metrics...</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                <div style={{ padding: '1.5rem', background: '#1a1a1a', borderRadius: '12px', border: '1px solid #333' }}>
                                    <h3 style={{ margin: 0, marginBottom: '1.5rem', fontSize: '1.1rem' }}>User Engagement</h3>
                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ color: '#94a3b8' }}>Active Ratio</span>
                                                <strong style={{ color: '#10b981' }}>{((dashboardStats.activeUsers / Math.max(1, dashboardStats.totalUsers) * 100)).toFixed(1)}%</strong>
                                            </div>
                                            <div style={{ background: '#333', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                                                <div style={{ background: '#10b981', height: '100%', width: `${(dashboardStats.activeUsers / Math.max(1, dashboardStats.totalUsers) * 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '1.5rem', background: '#1a1a1a', borderRadius: '12px', border: '1px solid #333' }}>
                                    <h3 style={{ margin: 0, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Vendor Approval</h3>
                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ color: '#94a3b8' }}>Verified Rate</span>
                                                <strong style={{ color: '#3b82f6' }}>{((dashboardStats.approvedVendors / Math.max(1, dashboardStats.totalVendors) * 100)).toFixed(1)}%</strong>
                                            </div>
                                            <div style={{ background: '#333', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                                                <div style={{ background: '#3b82f6', height: '100%', width: `${(dashboardStats.approvedVendors / Math.max(1, dashboardStats.totalVendors) * 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {stats && (
                                    <div style={{ padding: '1.5rem', background: '#1a1a1a', borderRadius: '12px', border: '1px solid #333' }}>
                                        <h3 style={{ margin: 0, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Order Pipeline</h3>
                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#252525', borderRadius: '8px' }}>
                                                <span style={{ color: '#94a3b8' }}>Completed</span>
                                                <strong style={{ color: '#10b981' }}>{stats.completedOrders || 0}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#252525', borderRadius: '8px' }}>
                                                <span style={{ color: '#94a3b8' }}>Pending</span>
                                                <strong style={{ color: '#f59e0b' }}>{stats.pendingOrders || 0}</strong>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Platform Users</h2>
                        {users.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #333' }}>
                                            <th style={{ padding: '1rem', color: '#94a3b8' }}>Full Name</th>
                                            <th style={{ padding: '1rem', color: '#94a3b8' }}>Email Address</th>
                                            <th style={{ padding: '1rem', color: '#94a3b8' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u._id} style={{ borderBottom: '1px solid #2d2d2d' }}>
                                                <td style={{ padding: '1rem', fontWeight: '500' }}>{u.name}</td>
                                                <td style={{ padding: '1rem', color: '#94a3b8' }}>{u.email}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{ color: u.isActive ? '#10b981' : '#ef4444', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                                        {u.isActive ? '● ACTIVE' : '● INACTIVE'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#94a3b8' }}>Zero users registered.</p>
                        )}
                    </div>
                )}

                {activeTab === 'vendors' && (
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Service Providers</h2>
                        {vendors.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #333' }}>
                                            <th style={{ padding: '1rem', color: '#94a3b8' }}>Company</th>
                                            <th style={{ padding: '1rem', color: '#94a3b8' }}>Business Info</th>
                                            <th style={{ padding: '1rem', color: '#94a3b8' }}>Status</th>
                                            <th style={{ padding: '1rem', color: '#94a3b8', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vendors.map(v => (
                                            <tr key={v._id} style={{ borderBottom: '1px solid #2d2d2d' }}>
                                                <td style={{ padding: '1rem', fontWeight: '500' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ 
                                                            fontSize: '0.7rem', 
                                                            padding: '0.15rem 0.5rem', 
                                                            borderRadius: '10px',
                                                            background: v.vendorType === 'VEHICLE_SALES' ? 'rgba(124, 58, 237, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                                            color: v.vendorType === 'VEHICLE_SALES' ? '#a78bfa' : '#60a5fa',
                                                            fontWeight: 'bold',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {v.vendorType === 'VEHICLE_SALES' ? '🚗 Sales' : '🔧 Repair'}
                                                        </span>
                                                        {v.subCategory && v.subCategory !== 'GENERAL_SERVICE' && (
                                                            <span style={{ 
                                                                fontSize: '0.65rem', 
                                                                padding: '0.15rem 0.4rem', 
                                                                borderRadius: '8px',
                                                                background: 'rgba(255, 255, 255, 0.05)',
                                                                color: '#cbd5e1',
                                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {v.subCategory === 'NEW_CARS' ? '✨ NEW' : '🚗 USED'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>{v.companyName}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{v.email || v.phone}</div>
                                                </td>
                                                <td style={{ padding: '1rem', color: '#94a3b8' }}>
                                                    <div style={{ fontSize: '0.85rem' }}>{v.description?.substring(0, 50)}{v.description?.length > 50 ? '...' : ''}</div>
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{v.city}{v.city && v.state ? ', ' : ''}{v.state}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <span style={{ 
                                                                padding: '0.25rem 0.75rem', 
                                                                borderRadius: '20px', 
                                                                fontSize: '0.7rem', 
                                                                fontWeight: 'bold',
                                                                background: v.approved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                                color: v.approved ? '#10b981' : '#f59e0b',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {v.approved ? 'VERIFIED' : 'PENDING'}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* Subscription Management */}
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Plan</span>
                                                                <select 
                                                                    value={v.subscriptionTier || 'BASIC'}
                                                                    onChange={(e) => handleUpdateSubscription(v._id, { 
                                                                        subscriptionTier: e.target.value,
                                                                        isSubscribed: v.isSubscribed
                                                                    })}
                                                                    style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', fontSize: '0.75rem', padding: '2px 4px', borderRadius: '4px' }}
                                                                >
                                                                    <option value="BASIC">BASIC</option>
                                                                    <option value="PREMIUM">PREMIUM</option>
                                                                </select>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Active</span>
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={v.isSubscribed}
                                                                    onChange={(e) => handleUpdateSubscription(v._id, { 
                                                                        isSubscribed: e.target.checked,
                                                                        subscriptionTier: v.subscriptionTier || 'BASIC'
                                                                    })}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                        <button 
                                                            onClick={() => setSelectedReviewVendor(v)}
                                                            className="btn btn-outline"
                                                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                                        >
                                                            <Eye size={14} /> Details
                                                        </button>
                                                        {!v.approved && (
                                                            <button 
                                                                onClick={() => handleApproveVendor(v._id)}
                                                                disabled={isProcessing}
                                                                className="btn btn-primary"
                                                                style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#94a3b8' }}>Zero vendors registered.</p>
                        )}
                    </div>
                )}
                {activeTab === 'plans' && (
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Subscription Plans</h2>
                            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Fetched: {plans.length} plans, {subscriptions.length} records</div>
                            <button 
                                onClick={() => {
                                    setEditingPlan(null);
                                    setPlanForm({ name: '', description: '', price: '', durationDays: '', features: '' });
                                    setShowPlanModal(true);
                                }} 
                                className="btn btn-primary" 
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Plus size={18} /> New Plan
                            </button>
                        </div>
                        
                        {plans.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {plans.map(plan => (
                                    <div key={plan._id} className="card" style={{ background: '#1a1a1a', border: '1px solid #333', opacity: plan.isActive ? 1 : 0.6 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                            <div>
                                                <h3 style={{ margin: 0, color: 'var(--primary)' }}>{plan.name}</h3>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>{plan.durationDays} Days Duration</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>${plan.price}</div>
                                                <span style={{ fontSize: '0.7rem', color: plan.isActive ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                                                    {plan.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                            <button 
                                                onClick={() => {
                                                    setEditingPlan(plan);
                                                    setPlanForm({ 
                                                        name: plan.name, 
                                                        description: plan.description, 
                                                        price: plan.price.toString(), 
                                                        durationDays: plan.durationDays.toString(), 
                                                        features: plan.features.join(', ') 
                                                    });
                                                    setShowPlanModal(true);
                                                }}
                                                className="btn btn-outline" 
                                                style={{ flex: 1, padding: '0.4rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                                            >
                                                <Edit size={14} /> Edit
                                            </button>
                                            <button 
                                                onClick={() => handleTogglePlan(plan._id)}
                                                className="btn btn-outline" 
                                                style={{ flex: 1, padding: '0.4rem', fontSize: '0.85rem', color: plan.isActive ? '#ef4444' : '#10b981', borderColor: plan.isActive ? '#ef444433' : '#10b98133' }}
                                            >
                                                {plan.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#94a3b8' }}>No plans created yet.</p>
                        )}

                        {/* Vendor Subscriptions Section */}
                        <div style={{ marginTop: '3rem', borderTop: '1px solid #333', paddingTop: '2.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Users size={24} color="var(--primary)" /> Vendor Subscriptions
                                </h2>
                            </div>
                            
                            {subscriptions.length > 0 ? (
                                <div className="card" style={{ padding: '0', background: 'transparent', border: '1px solid #333', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)', borderBottom: '2px solid #333' }}>
                                                <th style={{ padding: '1.25rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>Vendor / Contact</th>
                                                <th style={{ padding: '1.25rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>Plan</th>
                                                <th style={{ padding: '1.25rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>Date & Time</th>
                                                <th style={{ padding: '1.25rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>Amount</th>
                                                <th style={{ padding: '1.25rem 1rem', color: '#94a3b8', fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subscriptions.map(sub => (
                                                <tr key={sub._id} style={{ borderBottom: '1px solid #222' }}>
                                                    <td style={{ padding: '1.25rem 1rem' }}>
                                                        <div style={{ fontWeight: '600' }}>{sub.vendor?.companyName}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{sub.vendor?.user?.email}</div>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1rem' }}>
                                                        <span style={{ 
                                                            padding: '4px 10px', 
                                                            background: 'rgba(59, 130, 246, 0.1)', 
                                                            color: 'var(--primary)', 
                                                            borderRadius: '6px', 
                                                            fontSize: '0.75rem', 
                                                            fontWeight: 'bold' 
                                                        }}>
                                                            {sub.plan?.name}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1rem', fontSize: '0.85rem' }}>
                                                        <div>{new Date(sub.createdAt).toLocaleDateString()}</div>
                                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </td>
                                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                                        ${sub.amount}
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                                                        <button 
                                                            onClick={() => setSelectedReceipt(sub)}
                                                            className="btn btn-outline"
                                                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                                                        >
                                                            <FileText size={14} /> Receipt
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="card" style={{ textAlign: 'center', padding: '3rem', background: '#1a1a1a', border: '1px solid #333' }}>
                                    <p style={{ color: '#94a3b8', margin: 0 }}>No vendor subscriptions found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {activeTab === 'orders' && (
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>All Platform Orders</h2>
                            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Fetched: {orders.length} orders</div>
                        </div>
                        {orders.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #333' }}>
                                            <th style={{ padding: '1rem', color: '#94a3b8' }}>Order ID</th>
                                            <th style={{ padding: '1rem', color: '#94a3b8' }}>Item</th>
                                            <th style={{ padding: '1rem', color: '#94a3b8' }}>User</th>
                                            <th style={{ padding: '1rem', color: '#94a3b8' }}>Vendor</th>
                                            <th style={{ padding: '1rem', color: '#94a3b8' }}>Total</th>
                                            <th style={{ padding: '1rem', color: '#94a3b8' }}>Payment</th>
                                            <th style={{ padding: '1rem', color: '#94a3b8' }}>Booking For</th>
                                            <th style={{ padding: '1rem', color: '#94a3b8' }}>Status</th>
                                            <th style={{ padding: '1rem', color: '#94a3b8' }}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(o => (
                                            <tr key={o._id} style={{ borderBottom: '1px solid #2d2d2d' }}>
                                                <td style={{ padding: '1rem', fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                                                    #{o._id?.slice(-6).toUpperCase()}
                                                </td>
                                                <td style={{ padding: '1rem', fontWeight: '500' }}>
                                                    {o.item?.name || '—'}
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{o.item?.category}</div>
                                                </td>
                                                <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                                    {o.user?.name || o.user?.email || '—'}
                                                </td>
                                                <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                                    {o.vendor?.companyName || '—'}
                                                    {o.vendor?.vendorType && (
                                                        <div style={{ fontSize: '0.7rem', color: o.vendor.vendorType === 'VEHICLE_SALES' ? '#a78bfa' : '#60a5fa' }}>
                                                            {o.vendor.vendorType === 'VEHICLE_SALES' ? '🚗 Sales' : '🔧 Repair'}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '1rem', fontWeight: 'bold', color: '#10b981' }}>
                                                    ${o.totalAmount?.toFixed(2)}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ 
                                                        fontSize: '0.7rem', 
                                                        fontWeight: 'bold',
                                                        color: o.paymentStatus === 'COMPLETED' ? '#10b981' : o.paymentStatus === 'FAILED' ? '#ef4444' : '#f59e0b',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '0.2rem'
                                                    }}>
                                                        <span>● {o.paymentStatus || 'PENDING'}</span>
                                                        {o.transactionId && <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontFamily: 'monospace' }}>{o.transactionId}</span>}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {o.bookingDate ? (
                                                        <div style={{ fontSize: '0.8rem' }}>
                                                            <div>{o.bookingDate}</div>
                                                            <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{o.bookingTime}</div>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: '#4b5563' }}>—</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        padding: '0.2rem 0.6rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 'bold',
                                                        background: o.status === 'COMPLETED' ? 'rgba(16,185,129,0.1)' : o.status === 'REJECTED' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                                                        color: o.status === 'COMPLETED' ? '#10b981' : o.status === 'REJECTED' ? '#ef4444' : '#f59e0b'
                                                    }}>{o.status}</span>
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                                    {new Date(o.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#94a3b8' }}>No orders placed yet.</p>
                        )}
                    </div>
                )}
                {activeTab === 'marketplace' && (
                    <div style={{ marginTop: '-2rem' }}>
                        <ItemListingNew />
                    </div>
                )}
                </div>
                {showPlanModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                        <div className="card" style={{ maxWidth: '500px', width: '95%', background: '#1e1e1e', borderRadius: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0 }}>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
                                <button onClick={() => setShowPlanModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><XCircle /></button>
                            </div>
                            <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Plan Name</label>
                                    <input 
                                        type="text" 
                                        className="input-field" 
                                        value={planForm.name} 
                                        onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                                        required 
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Price ($)</label>
                                        <input 
                                            type="number" 
                                            className="input-field" 
                                            value={planForm.price} 
                                            onChange={(e) => setPlanForm({...planForm, price: e.target.value})}
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Duration (Days)</label>
                                        <input 
                                            type="number" 
                                            className="input-field" 
                                            value={planForm.durationDays} 
                                            onChange={(e) => setPlanForm({...planForm, durationDays: e.target.value})}
                                            required 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowPlanModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                                <button type="button" onClick={() => handleSavePlan()} disabled={isProcessing} className="btn btn-primary" style={{ flex: 2 }}>
                                    {isProcessing ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            {/* Receipt Details Modal */}
            {selectedReceipt && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
                    <div style={{ background: '#fff', color: '#1a1a1a', padding: '2.5rem', borderRadius: '16px', maxWidth: '450px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                                <ShieldCheck size={56} />
                            </div>
                            <h2 style={{ margin: 0, color: '#1a1a1a' }}>Vendor Subscription</h2>
                            <p style={{ color: '#64748b', margin: '0.5rem 0' }}>Payment Confirmation Receipt</p>
                        </div>
                        
                        <div style={{ borderTop: '1px dashed #e2e8f0', borderBottom: '1px dashed #e2e8f0', padding: '1.5rem 0', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ color: '#64748b' }}>Transaction ID</span>
                                <span style={{ fontWeight: '600' }}>#{selectedReceipt.transactionId}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ color: '#64748b' }}>Vendor</span>
                                <span style={{ fontWeight: '600' }}>{selectedReceipt.vendor?.companyName}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ color: '#64748b' }}>Subscription Plan</span>
                                <span style={{ fontWeight: '600' }}>{selectedReceipt.plan?.name}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ color: '#64748b' }}>Payment Date</span>
                                <span style={{ fontWeight: '600' }}>{new Date(selectedReceipt.startDate).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ color: '#64748b' }}>Expiry Date</span>
                                <span style={{ fontWeight: '600' }}>{new Date(selectedReceipt.endDate).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ color: '#64748b' }}>Payment Method</span>
                                <span style={{ fontWeight: '600' }}>{selectedReceipt.paymentMethod}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748b' }}>Status</span>
                                <span style={{ fontWeight: '600', color: '#10b981' }}>{selectedReceipt.status}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total Amount Paid</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>${selectedReceipt.amount?.toFixed(2)}</span>
                        </div>

                        <button 
                            onClick={() => setSelectedReceipt(null)}
                            style={{ 
                                width: '100%', padding: '1rem', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'opacity 0.2s' 
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
                {/* Vendor Review Modal */}
                {selectedReviewVendor && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                        <div className="card" style={{ maxWidth: '600px', width: '95%', background: '#1e1e1e', borderRadius: '15px', padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Store size={24} color="var(--primary)" /> Business Profile
                                </h2>
                                <button onClick={() => setSelectedReviewVendor(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><XCircle /></button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Company Name</label>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{selectedReviewVendor.companyName}</div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Phone</label>
                                        <div style={{ fontSize: '1rem', color: '#fff' }}>{selectedReviewVendor.phone || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Vendor Type</label>
                                        <div style={{ fontSize: '0.9rem', color: '#fff' }}>
                                            {selectedReviewVendor.vendorType === 'VEHICLE_SALES' ? '🚗 Vehicle Sales' : '🔧 Repair & Service'}
                                            {selectedReviewVendor.subCategory && <span style={{ color: '#94a3b8' }}> · {selectedReviewVendor.subCategory.replace('_', ' ')}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Street Address</label>
                                        <div style={{ fontSize: '0.9rem', color: '#fff' }}>{selectedReviewVendor.address || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem', textTransform: 'uppercase' }}>City / State</label>
                                        <div style={{ fontSize: '0.9rem', color: '#fff' }}>{selectedReviewVendor.city}{selectedReviewVendor.city && selectedReviewVendor.state ? ', ' : ''}{selectedReviewVendor.state}</div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Zip Code</label>
                                        <div style={{ fontSize: '0.9rem', color: '#fff' }}>{selectedReviewVendor.zipCode || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #333' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Business Description</label>
                                <div style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid #2d2d2d' }}>
                                    {selectedReviewVendor.description || 'No description provided.'}
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setSelectedReviewVendor(null)} className="btn btn-outline" style={{ flex: 1 }}>Close</button>
                                {!selectedReviewVendor.approved && (
                                    <button 
                                        onClick={() => { handleApproveVendor(selectedReviewVendor._id); setSelectedReviewVendor(null); }} 
                                        className="btn btn-primary" 
                                        style={{ flex: 1.5 }}
                                    >
                                        Approve Vendor
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
