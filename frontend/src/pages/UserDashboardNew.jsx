// User Dashboard - Unified Flow
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import Alert from '../components/Alert';
import ItemListingNew from './ItemListingNew';
import { Search, X, AlertCircle, CheckCircle, Clock, LogOut, CreditCard, Package, TrendingUp, Car, Home, Store, Wrench, Phone, MapPin, Star, ChevronRight, FileText, Download } from 'lucide-react';
import bgImage from '../images/feature-1.jpg';

const UserDashboardNew = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancelingOrder, setCancelingOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('home');

    // Vendor browse state
    const [vendors, setVendors] = useState([]);
    const [vendorsLoading, setVendorsLoading] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [vendorItems, setVendorItems] = useState([]);
    const [vendorItemsLoading, setVendorItemsLoading] = useState(false);
    const [bookingItem, setBookingItem] = useState(null);
    const [bookingQty, setBookingQty] = useState(1);
    const [bookingProcessing, setBookingProcessing] = useState(false);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [bookingStep, setBookingStep] = useState(1); // 1: Details, 2: Payment, 3: Success
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Credit Card');
    const [showReceipt, setShowReceipt] = useState(false);
    const [recentOrder, setRecentOrder] = useState(null);
    const [vendorCategory, setVendorCategory] = useState('SERVICES'); // SERVICES, NEW_CARS, USED_CARS

    // Per-order receipt state (My Orders tab)
    const [orderReceiptData, setOrderReceiptData] = useState(null);
    const [showOrderReceipt, setShowOrderReceipt] = useState(false);
    const [loadingReceipt, setLoadingReceipt] = useState(false);

    const [paymentInfo] = useState({
        cardNumber: '**** **** **** 4532',
        cardHolder: user?.name || 'Customer',
        expiryDate: '12/25'
    });

    useEffect(() => {
        // Only redirect if user is loaded but has the wrong role
        if (user && user.role !== 'USER') {
            navigate('/');
            return;
        }
        // Don't fetch data if user isn't loaded yet
        if (!user) return;
        fetchOrders();
        fetchVendors();
    }, [currentPage, user]);

    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get(`/orders/user/my-orders?page=${currentPage}&limit=10`);
            setOrders(data.orders || []);
            setTotalPages(data.pagination?.pages || 1);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchVendors = async () => {
        setVendorsLoading(true);
        try {
            const { data } = await api.get('/auth/vendors/public');
            setVendors(data.vendors || []);
        } catch (err) {
            console.error('Failed to fetch vendors', err);
        } finally {
            setVendorsLoading(false);
        }
    };

    const openVendorDetail = async (vendor) => {
        // Immediately show modal with cached data while fresh data loads
        setSelectedVendor(vendor);
        setVendorItemsLoading(true);
        try {
            // Fetch fresh vendor profile + items in parallel
            const [itemsRes, vendorRes] = await Promise.allSettled([
                api.get(`/items?vendorId=${vendor._id}&available=true&limit=20`),
                api.get(`/public/vendors/${vendor._id}`)
            ]);
            setVendorItems(itemsRes.status === 'fulfilled' ? (itemsRes.value.data.items || []) : []);
            // Update vendor data with freshest profile from DB
            if (vendorRes.status === 'fulfilled' && vendorRes.value.data.vendor) {
                setSelectedVendor(vendorRes.value.data.vendor);
            }
        } catch (err) {
            setVendorItems([]);
        } finally {
            setVendorItemsLoading(false);
        }
    };

    const handleBook = async () => {
        if (!bookingItem) return;
        setBookingProcessing(true);
        setError('');
        
        try {
            const { data } = await api.post('/orders', { 
                itemId: bookingItem._id, 
                quantity: bookingQty,
                bookingDate,
                bookingTime,
                paymentMethod: selectedPaymentMethod
            });
            
            setRecentOrder(data);
            setBookingStep(3); // Show Success State
            
            // Wait for 1.5 seconds to show the success message before showing receipt
            setTimeout(() => {
                setShowReceipt(true);
                // Clear booking states but keep recentOrder for the receipt
                setBookingItem(null);
                setBookingStep(1);
                setBookingQty(1);
                setBookingDate('');
                setBookingTime('');
                fetchOrders();
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed');
            setBookingStep(2); // Stay on payment step if failed
        } finally {
            setBookingProcessing(false);
        }
    };

    // Download a receipt as a text file
    const handleDownloadReceipt = (data) => {
        if (!data) return;
        const lines = [
            '==========================================',
            '         FLEETOPS — BOOKING RECEIPT',
            '==========================================',
            `Date:            ${new Date(data.createdAt || new Date()).toLocaleString()}`,
            `Order ID:        #${(data.orderId || data._id || '').toString().slice(-8).toUpperCase()}`,
            `Transaction ID:  ${data.transactionId || 'N/A'}`,
            '------------------------------------------',
            `Service / Item:  ${data.item?.name || data.item || 'N/A'}`,
            `Vendor:          ${data.vendor?.companyName || data.vendor || 'N/A'}`,
            `Quantity:        ${data.quantity || 1}`,
            '------------------------------------------',
            `Booking Date:    ${data.bookingDate || 'N/A'}`,
            `Booking Time:    ${data.bookingTime || 'N/A'}`,
            '------------------------------------------',
            `Payment Method:  ${data.paymentMethod || 'N/A'}`,
            `Payment Status:  ${data.paymentStatus || 'COMPLETED'}`,
            `Status:          ${data.status || 'CREATED'}`,
            '------------------------------------------',
            `TOTAL AMOUNT:    $${((data.totalAmount || 0)).toFixed(2)}`,
            '==========================================',
            'Thank you for using FleetOps!',
            '=========================================='
        ];
        const content = lines.join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `fleetops_receipt_${(data.orderId || data._id || Date.now()).toString().slice(-8)}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    // Fetch and show receipt for a specific past order
    const handleViewOrderReceipt = async (order) => {
        setLoadingReceipt(true);
        try {
            const { data } = await api.get(`/orders/${order._id}/receipt`);
            setOrderReceiptData(data);
            setShowOrderReceipt(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not load receipt');
        } finally {
            setLoadingReceipt(false);
        }
    };

    const handlePrintReceipt = () => {
        handleDownloadReceipt(recentOrder);
    };

    const handleCancelOrder = async (orderId) => {
        setCancelingOrder(orderId);
        setError('');
        try {
            await api.put(`/orders/${orderId}/cancel`);
            setSuccess('Order cancelled successfully');
            fetchOrders();
            setSelectedOrder(null);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancelingOrder(null);
        }
    };

    const getStats = () => {
        const completed = orders.filter(o => o.status === 'COMPLETED').length;
        const pending = orders.filter(o => ['CREATED', 'ACCEPTED', 'IN_PROGRESS'].includes(o.status)).length;
        const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        return { completed, pending, totalSpent };
    };

    const stats = getStats();

    const filteredVendors = vendors.filter(v => {
        if (vendorCategory === 'SERVICES') return v.vendorType === 'REPAIR';
        if (vendorCategory === 'NEW_CARS') return v.vendorType === 'VEHICLE_SALES' && v.subCategory === 'NEW_CARS';
        if (vendorCategory === 'USED_CARS') return v.vendorType === 'VEHICLE_SALES' && v.subCategory === 'USED_CARS';
        return false;
    });

    const VendorCard = ({ vendor }) => {
        const isSales = vendor.vendorType === 'VEHICLE_SALES';
        const subCat = vendor.subCategory || '';
        
        let categoryLabel = 'Repair Center';
        let categoryColor = '#60a5fa';
        let categoryIcon = '🔧';

        if (isSales) {
            if (subCat === 'NEW_CARS') {
                categoryLabel = 'Showroom (New Cars)';
                categoryColor = '#a78bfa';
                categoryIcon = '✨';
            } else {
                categoryLabel = 'Showroom (Used Cars)';
                categoryColor = '#f59e0b';
                categoryIcon = '🚗';
            }
        }

        return (
            <div
                onClick={() => openVendorDetail(vendor)}
                style={{
                    background: '#1e1e1e',
                    border: '1px solid #333',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, transform 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = categoryColor; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
                {/* Visual indicator bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: categoryColor }}></div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '10px',
                        background: `${categoryColor}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.4rem'
                    }}>
                        {categoryIcon}
                    </div>
                    <span style={{
                        fontSize: '0.65rem', fontWeight: 'bold', padding: '0.2rem 0.5rem', borderRadius: '8px',
                        background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)'
                    }}>VERIFIED</span>
                </div>
                
                <div style={{ marginTop: '0.25rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{vendor.companyName}</h3>
                    <div style={{ 
                        fontSize: '0.72rem', color: categoryColor, fontWeight: '600', 
                        textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' 
                    }}>
                        {categoryLabel}
                    </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', minHeight: '2.4rem', borderTop: '1px solid #333', paddingTop: '0.75rem', lineClamp: 2 }}>
                    {vendor.description || 'Professional automotive services and vehicle solutions.'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #2d2d2d' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>View Inventory & Service</span>
                    <ChevronRight size={14} color={categoryColor} />
                </div>
            </div>
        );
    };

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
                        className={`dash-sidebar-btn ${activeTab === 'home' ? 'active' : ''}`}
                        onClick={() => setActiveTab('home')}
                    >
                        <Home size={20} /> <span>Home</span>
                    </button>
                    <div style={{ margin: '0.5rem 0 0.5rem 0', padding: '0 1rem', fontSize: '0.65rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Automotive</div>
                    <button 
                        className={`dash-sidebar-btn ${activeTab === 'repairs' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('repairs'); setVendorCategory('SERVICES'); }}
                    >
                        <Wrench size={20} /> <span>Repair Services</span>
                    </button>
                    <button 
                        className={`dash-sidebar-btn ${activeTab === 'new_cars' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('new_cars'); setVendorCategory('NEW_CARS'); }}
                    >
                        <Car size={20} color="#a78bfa" /> <span style={{ color: activeTab === 'new_cars' ? '#fff' : '#a78bfa' }}>New Showrooms</span>
                    </button>
                    <button 
                        className={`dash-sidebar-btn ${activeTab === 'used_cars' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('used_cars'); setVendorCategory('USED_CARS'); }}
                    >
                        <Car size={20} color="#f59e0b" /> <span style={{ color: activeTab === 'used_cars' ? '#fff' : '#f59e0b' }}>Used Centers</span>
                    </button>
                    <button 
                        className={`dash-sidebar-btn ${activeTab === 'marketplace' ? 'active' : ''}`}
                        onClick={() => setActiveTab('marketplace')}
                    >
                        <Search size={20} /> <span>Marketplace</span>
                    </button>
                    <div style={{ margin: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
                    <button 
                        className={`dash-sidebar-btn ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <Package size={20} /> <span>My Orders</span>
                    </button>
                    <button 
                        className={`dash-sidebar-btn ${activeTab === 'payment' ? 'active' : ''}`}
                        onClick={() => setActiveTab('payment')}
                    >
                        <CreditCard size={20} /> <span>Payment</span>
                    </button>
                </div>

                <div className="dash-sidebar-footer">
                    <div style={{ padding: '0 0.5rem 1rem 0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ 
                                width: '36px', height: '36px', borderRadius: '50%', 
                                backgroundColor: '#8b5cf6', display: 'flex', alignItems: 'center', 
                                justifyContent: 'center', color: 'white', fontWeight: 'bold'
                            }}>
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name}</p>
                                <span style={{ fontSize: '0.75rem', color: '#a78bfa', backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '500' }}>
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

                {/* Welcome & Stats */}
                {activeTab === 'home' && (
                    <>
                        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Welcome, {user?.name}</h1>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--primary)', fontWeight: 'bold', letterSpacing: '1px', fontSize: '0.7rem' }}>👤 USER DATABASE RECORD</p>
                    </div>
                    <div style={{ textAlign: 'right', color: '#94a3b8', fontSize: '0.85rem' }}>
                        ID: {user?._id}
                    </div>
                </div>          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                            <div className="card" style={{ borderLeft: '4px solid var(--primary)', background: 'var(--dark-card)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Total Orders</p>
                                        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{orders.length}</p>
                                    </div>
                                    <Package size={32} style={{ color: 'var(--primary)', opacity: 0.5 }} />
                                </div>
                            </div>
                            <div className="card" style={{ borderLeft: '4px solid #f59e0b', background: 'var(--dark-card)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Active Orders</p>
                                        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{stats.pending}</p>
                                    </div>
                                    <Clock size={32} style={{ color: '#f59e0b', opacity: 0.5 }} />
                                </div>
                            </div>
                            <div className="card" style={{ borderLeft: '4px solid #10b981', background: 'var(--dark-card)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Completed</p>
                                        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{stats.completed}</p>
                                    </div>
                                    <CheckCircle size={32} style={{ color: '#10b981', opacity: 0.5 }} />
                                </div>
                            </div>
                            <div className="card" style={{ borderLeft: '4px solid #8b5cf6', background: 'var(--dark-card)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Total Spent</p>
                                        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>${stats.totalSpent.toFixed(0)}</p>
                                    </div>
                                    <TrendingUp size={32} style={{ color: '#8b5cf6', opacity: 0.5 }} />
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ===== VENDORS TABS ===== */}
                {['repairs', 'new_cars', 'used_cars'].includes(activeTab) && (
                    <div>
                        {vendorsLoading ? (
                            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>Loading vendors...</p>
                        ) : filteredVendors.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                                <Store size={48} style={{ color: '#333', marginBottom: '1.5rem' }} />
                                <h3 style={{ color: '#fff' }}>No vendors available in this category</h3>
                                <p style={{ color: '#94a3b8' }}>Our team is working on onboarding top-tier vendors for you.</p>
                            </div>
                        ) : (
                            <>
                                {/* Filtered Vendors Display */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                        <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                                            {vendorCategory === 'SERVICES' ? <Wrench size={22} color="#60a5fa" /> : <Car size={22} color={vendorCategory === 'NEW_CARS' ? '#a78bfa' : '#f59e0b'} />}
                                        </div>
                                        <div>
                                            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>
                                                {vendorCategory === 'SERVICES' && 'Repair & Service Centers'}
                                                {vendorCategory === 'NEW_CARS' && 'Exclusive New Car Showrooms'}
                                                {vendorCategory === 'USED_CARS' && 'Certified Used Car Centers'}
                                            </h2>
                                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                                                {vendorCategory === 'SERVICES' && 'Top-rated vehicle repairs, maintenance, and diagnostics'}
                                                {vendorCategory === 'NEW_CARS' && 'Authorized dealers for brand new flagship vehicles'}
                                                {vendorCategory === 'USED_CARS' && 'Reliable pre-owned and certified second-hand vehicles'}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                        {filteredVendors.map(v => <VendorCard key={v._id} vendor={v} />)}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Tab Content — Orders */}
                {activeTab === 'orders' && (
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0 }}>My Recent Orders</h2>
                        </div>

                        {loading ? (
                            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Loading your orders...</p>
                        ) : orders.length > 0 ? (
                            <>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #333' }}>
                                                <th style={{ padding: '1rem', color: '#94a3b8' }}>Order Detail</th>
                                                <th style={{ padding: '1rem', color: '#94a3b8' }}>Vendor</th>
                                                <th style={{ padding: '1rem', color: '#94a3b8' }}>Status</th>
                                                <th style={{ padding: '1rem', color: '#94a3b8', textAlign: 'right' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order._id} style={{ borderBottom: '1px solid #2d2d2d' }}>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: '500', color: '#fff' }}>{order.item?.name || 'Service'}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Placed on {new Date(order.createdAt).toLocaleDateString()}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: 'bold' }}>${order.totalAmount?.toFixed(2)}</div>
                                                    </td>
                                                    <td style={{ padding: '1rem', color: '#94a3b8' }}>
                                                        {order.vendor?.companyName || 'N/A'}
                                                        {order.vendor?.vendorType && (
                                                            <div style={{ fontSize: '0.7rem', color: order.vendor.vendorType === 'VEHICLE_SALES' ? '#a78bfa' : '#60a5fa' }}>
                                                                {order.vendor.vendorType === 'VEHICLE_SALES' ? '🚗 Sales' : '🔧 Repair'}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{ 
                                                            padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
                                                            background: order.status === 'COMPLETED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                                            color: order.status === 'COMPLETED' ? '#10b981' : '#f59e0b'
                                                        }}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.4rem', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                        {['CREATED', 'ACCEPTED'].includes(order.status) && (
                                                            <button 
                                                                disabled={cancelingOrder === order._id}
                                                                onClick={() => handleCancelOrder(order._id)}
                                                                style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                                            >
                                                                {cancelingOrder === order._id ? '...' : 'Cancel'}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setSelectedOrder(order)}
                                                            className="btn btn-outline"
                                                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                                        >
                                                            View
                                                        </button>
                                                        {!['CANCELLED', 'REJECTED'].includes(order.status) && (
                                                            <button
                                                                onClick={() => handleViewOrderReceipt(order)}
                                                                disabled={loadingReceipt}
                                                                style={{ background: 'none', border: '1px solid #60a5fa', color: '#60a5fa', padding: '0.25rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                                                title="View / Download Receipt"
                                                            >
                                                                <FileText size={13} /> Receipt
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {totalPages > 1 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn btn-outline">← Previous</button>
                                        <span style={{ alignSelf: 'center', fontWeight: 'bold', color: '#fff' }}>Page {currentPage} of {totalPages}</span>
                                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn btn-outline">Next →</button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                                <Package size={48} style={{ color: '#333', marginBottom: '1.5rem' }} />
                                <h3 style={{ color: '#fff', margin: '0 0 1rem 0' }}>No orders yet</h3>
                                <p style={{ color: '#94a3b8', margin: '0 0 2rem 0' }}>Browse vendors and make your first booking today!</p>
                                <button onClick={() => setActiveTab('vendors')} className="btn btn-primary">Find Vendors</button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'payment' && (() => {
                    const paidOrders = orders.filter(o => o.paymentStatus === 'COMPLETED' || o.paymentMethod);
                    const totalPaid = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                    const methodCounts = paidOrders.reduce((acc, o) => {
                        const m = o.paymentMethod || 'MOCK_PAYMENT';
                        acc[m] = (acc[m] || 0) + 1;
                        return acc;
                    }, {});
                    const topMethod = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

                    return (
                        <div className="card" style={{ padding: '2rem' }}>
                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ padding: '0.75rem', background: 'rgba(59,130,246,0.1)', borderRadius: '12px' }}>
                                    <CreditCard size={28} color="var(--primary)" />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0 }}>Payment History</h2>
                                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>All your transactions in one place</p>
                                </div>
                            </div>

                            {/* Summary cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                {[
                                    { label: 'Total Spent', value: `$${totalPaid.toFixed(2)}`, color: '#10b981' },
                                    { label: 'Transactions', value: paidOrders.length, color: '#60a5fa' },
                                    { label: 'Top Method', value: topMethod, color: '#a78bfa' }
                                ].map(({ label, value, color }) => (
                                    <div key={label} style={{ background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: '12px', padding: '1.25rem' }}>
                                        <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.8rem', color: '#94a3b8' }}>{label}</p>
                                        <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color }}>{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Transaction list */}
                            {paidOrders.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                                    <CreditCard size={48} style={{ color: '#333', marginBottom: '1.5rem' }} />
                                    <h3 style={{ color: '#fff', margin: '0 0 0.5rem 0' }}>No payments yet</h3>
                                    <p style={{ color: '#64748b', margin: '0 0 1.5rem 0' }}>Your payment history will appear here after your first booking.</p>
                                    <button onClick={() => setActiveTab('vendors')} className="btn btn-primary">Find Vendors</button>
                                </div>
                            ) : (
                                <>
                                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Transactions</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {paidOrders.map(order => (
                                            <div
                                                key={order._id}
                                                style={{
                                                    background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: '12px',
                                                    padding: '1rem 1.25rem', display: 'flex', alignItems: 'center',
                                                    gap: '1rem', flexWrap: 'wrap'
                                                }}
                                            >
                                                {/* Icon */}
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                                                    background: 'rgba(16,185,129,0.1)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <CheckCircle size={20} color="#10b981" />
                                                </div>

                                                {/* Details */}
                                                <div style={{ flex: 1, minWidth: '120px' }}>
                                                    <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.95rem' }}>
                                                        {order.item?.name || 'Service'}
                                                    </div>
                                                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                                                        {order.vendor?.companyName || '—'} · {new Date(order.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>

                                                {/* Method badge */}
                                                <span style={{
                                                    fontSize: '0.72rem', fontWeight: '600', padding: '0.2rem 0.6rem',
                                                    borderRadius: '8px', background: 'rgba(139,92,246,0.1)', color: '#a78bfa',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {order.paymentMethod || 'MOCK_PAYMENT'}
                                                </span>

                                                {/* Amount */}
                                                <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#10b981', minWidth: '65px', textAlign: 'right' }}>
                                                    ${order.totalAmount?.toFixed(2)}
                                                </div>

                                                {/* Receipt button */}
                                                {!['CANCELLED', 'REJECTED'].includes(order.status) && (
                                                    <button
                                                        onClick={() => handleViewOrderReceipt(order)}
                                                        disabled={loadingReceipt}
                                                        style={{
                                                            background: 'none', border: '1px solid #60a5fa', color: '#60a5fa',
                                                            padding: '0.3rem 0.7rem', borderRadius: '8px', cursor: 'pointer',
                                                            fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0
                                                        }}
                                                    >
                                                        <FileText size={13} /> Receipt
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })()}

                {activeTab === 'marketplace' && (
                    <div style={{ marginTop: '-2rem' }}>
                        <ItemListingNew onBook={(item) => {
                            setBookingItem(item);
                            setBookingQty(1);
                        }} />
                    </div>
                )}
                </div>
            </main>

            {/* ===== VENDOR DETAIL MODAL ===== */}
            {selectedVendor && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '2rem' }}
                    onClick={() => { setSelectedVendor(null); setVendorItems([]); }}>
                    <div className="card" style={{ maxWidth: '700px', width: '100%', background: '#1a1a1a', borderRadius: '20px' }} onClick={e => e.stopPropagation()}>
                        {/* Vendor Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ fontSize: '2.5rem' }}>{selectedVendor.vendorType === 'VEHICLE_SALES' ? '🚗' : '🔧'}</div>
                                <div>
                                    <h2 style={{ margin: 0 }}>{selectedVendor.companyName}</h2>
                                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '10px', background: selectedVendor.vendorType === 'VEHICLE_SALES' ? 'rgba(124,58,237,0.2)' : 'rgba(59,130,246,0.2)', color: selectedVendor.vendorType === 'VEHICLE_SALES' ? '#a78bfa' : '#60a5fa', fontWeight: 'bold' }}>
                                        {selectedVendor.vendorType === 'VEHICLE_SALES' ? 'Vehicle Sales' : 'Repair & Service'}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => { setSelectedVendor(null); setVendorItems([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                        </div>

                        {/* Vendor Info */}
                        <div style={{ background: '#252525', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                            {selectedVendor.description && <p style={{ margin: 0, color: '#cbd5e1' }}>{selectedVendor.description}</p>}
                        </div>

                        {/* Items / Listings */}
                        <h3 style={{ marginBottom: '1rem' }}>
                            {selectedVendor.vendorType === 'VEHICLE_SALES' ? '🚗 Available Vehicles' : '🔧 Services & Repairs'}
                        </h3>

                        {vendorItemsLoading ? (
                            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Loading listings...</p>
                        ) : vendorItems.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No listings available yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                                {vendorItems.map(item => (
                                    <div key={item._id} style={{ background: '#252525', borderRadius: '12px', padding: '1rem', border: '1px solid #333', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                        {/* Item Image */}
                                        <div style={{ width: '100px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#1a1a1a' }}>
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                                                    {item.category === 'CAR' ? <Car size={32} /> : <Wrench size={32} />}
                                                </div>
                                            )}
                                        </div>

                                        {/* Item Info */}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', color: '#fff', fontSize: '1rem' }}>{item.name}</div>
                                            {item.category === 'CAR' && (
                                                <div style={{ fontSize: '0.8rem', color: '#60a5fa', margin: '0.2rem 0' }}>
                                                    {item.brand} {item.model} {item.year && `(${item.year})`} · {item.fuelType} · {item.transmission}
                                                    {item.mileage ? ` · ${item.mileage.toLocaleString()} km` : ''}
                                                </div>
                                            )}
                                            <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineClamp: 1, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {item.description}
                                            </div>
                                        </div>

                                        {/* Price & Action */}
                                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#10b981' }}>${item.price?.toFixed(2)}</div>
                                            <button
                                                className="btn btn-primary"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                                                onClick={() => setBookingItem(item)}
                                            >
                                                {item.category === 'CAR' ? 'Buy Now' : 'Book'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ===== BOOKING CONFIRMATION MODAL ===== */}
            {bookingItem && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
                    <div className="card" style={{ maxWidth: '480px', width: '95%', background: '#1e1e1e', borderRadius: '20px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #333', padding: '1.5rem' }}>
                        {error && <Alert type="error" message={error} onClose={() => setError('')} style={{ marginBottom: '1rem' }} />}
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>
                                {bookingStep === 1 && (bookingItem.category === 'CAR' ? '🚗 Purchase Details' : '🔧 Booking Details')}
                                {bookingStep === 2 && '💳 Secure Payment'}
                                {bookingStep === 3 && '✅ Status'}
                            </h3>
                            {bookingStep !== 3 && (
                                <button onClick={() => { setBookingItem(null); setBookingStep(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                    <X size={22} />
                                </button>
                            )}
                        </div>

                        {/* STEP 1: BOOKING DETAILS */}
                        {bookingStep === 1 && (
                            <>
                                <div style={{ background: '#252525', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#fff' }}>{bookingItem.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Unit Price: ${bookingItem.price?.toFixed(2)}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>${(bookingItem.price * bookingQty).toFixed(2)}</p>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Total Amount</p>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #333', paddingTop: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.8rem' }}>Preferred Date</label>
                                            <input 
                                                type="date" 
                                                className="form-control" 
                                                style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
                                                value={bookingDate}
                                                onChange={e => setBookingDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.8rem' }}>Preferred Time</label>
                                            <input 
                                                type="time" 
                                                className="form-control" 
                                                style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
                                                value={bookingTime}
                                                onChange={e => setBookingTime(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        if (!bookingDate || !bookingTime) {
                                            setError('Please select a date and time.');
                                            return;
                                        }
                                        setBookingStep(2);
                                    }} 
                                    className="btn btn-primary" 
                                    style={{ width: '100%' }}
                                >
                                    Continue to Payment
                                </button>
                            </>
                        )}

                        {/* STEP 2: PAYMENT */}
                        {bookingStep === 2 && (
                            <>
                                <div style={{ background: '#252525', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Amount to Pay</p>
                                    <h2 style={{ margin: '0.25rem 0', color: '#10b981' }}>${(bookingItem.price * bookingQty).toFixed(2)}</h2>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: '600' }}>SELECT PAYMENT METHOD</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        {[
                                            { id: 'Credit Card', icon: '💳', label: 'Card' },
                                            { id: 'UPI', icon: '📱', label: 'UPI' },
                                            { id: 'PayPal', icon: '🅿', label: 'PayPal' },
                                            { id: 'Cash', icon: '💵', label: 'Cash' }
                                        ].map(method => (
                                            <label 
                                                key={method.id}
                                                style={{ 
                                                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', 
                                                    background: selectedPaymentMethod === method.id ? 'rgba(59, 130, 246, 0.1)' : '#1a1a1a',
                                                    border: `1px solid ${selectedPaymentMethod === method.id ? 'var(--primary)' : '#333'}`,
                                                    borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s'
                                                }}
                                            >
                                                <input 
                                                    type="radio" 
                                                    name="payMethod" 
                                                    checked={selectedPaymentMethod === method.id}
                                                    onChange={() => setSelectedPaymentMethod(method.id)}
                                                    style={{ display: 'none' }}
                                                />
                                                <span style={{ fontSize: '1.1rem' }}>{method.icon}</span>
                                                <span style={{ fontSize: '0.9rem', fontWeight: selectedPaymentMethod === method.id ? '600' : '400', color: selectedPaymentMethod === method.id ? '#fff' : '#cbd5e1' }}>{method.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button onClick={() => setBookingStep(1)} className="btn btn-outline" style={{ flex: 1 }}>Back</button>
                                    <button onClick={handleBook} disabled={bookingProcessing} className="btn btn-primary" style={{ flex: 2, opacity: bookingProcessing ? 0.7 : 1 }}>
                                        {bookingProcessing ? 'Processing...' : 'Pay Now'}
                                    </button>
                                </div>
                            </>
                        )}

                        {/* STEP 3: SUCCESS */}
                        {bookingStep === 3 && (
                            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                                <div style={{ 
                                    width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
                                }}>
                                    <CheckCircle size={48} color="#10b981" />
                                </div>
                                <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Payment Successful!</h2>
                                <p style={{ color: '#94a3b8' }}>Your booking has been confirmed. Generating receipt...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedOrder(null)}>
                    <div className="card" style={{ maxWidth: '500px', width: '95%', background: '#1e1e1e' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Order Details</h2>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                        </div>
                        <div style={{ background: '#2d2d2d', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>Item</p>
                                <p style={{ margin: 0, fontWeight: 'bold' }}>{selectedOrder.item?.name}</p>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>Vendor</p>
                                <p style={{ margin: 0 }}>{selectedOrder.vendor?.companyName}</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>Total Paid</p>
                                    <p style={{ margin: 0, fontWeight: 'bold', color: '#10b981' }}>${selectedOrder.totalAmount?.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>Status</p>
                                    <p style={{ margin: 0, color: '#f59e0b', fontWeight: 'bold' }}>{selectedOrder.status}</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setSelectedOrder(null)} className="btn btn-primary" style={{ width: '100%' }}>Close</button>
                    </div>
                </div>
            )}

            {/* ===== BOOKING CONFIRMATION RECEIPT MODAL ===== */}
            {showReceipt && recentOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
                    <div style={{ background: '#fff', color: '#1a1a1a', padding: '2rem', borderRadius: '16px', maxWidth: '420px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ color: '#10b981', marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>
                                <CheckCircle size={56} />
                            </div>
                            <h2 style={{ margin: 0, color: '#1a1a1a' }}>Booking Confirmed!</h2>
                            <p style={{ color: '#64748b', margin: '0.4rem 0 0 0', fontSize: '0.9rem' }}>Transaction Successful</p>
                        </div>
                        
                        <div style={{ borderTop: '2px dashed #e2e8f0', borderBottom: '2px dashed #e2e8f0', padding: '1.25rem 0', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
                            {[
                                ['Order ID', `#${recentOrder._id?.slice(-8).toUpperCase()}`],
                                ['Service / Item', recentOrder.item?.name],
                                ['Vendor', recentOrder.vendor?.companyName],
                                ['Booking Date', recentOrder.bookingDate],
                                ['Booking Time', recentOrder.bookingTime],
                                ['Qty', recentOrder.quantity],
                                ['Payment Mode', recentOrder.paymentMethod || selectedPaymentMethod],
                                ['Payment Status', recentOrder.paymentStatus || 'COMPLETED']
                            ].map(([label, val]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                    <span style={{ color: '#64748b' }}>{label}</span>
                                    <span style={{ fontWeight: '600', maxWidth: '55%', textAlign: 'right' }}>{val}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0.75rem 0' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Total Amount Paid</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>${recentOrder.totalAmount?.toFixed(2)}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button 
                                onClick={() => handleDownloadReceipt(recentOrder)}
                                style={{ flex: 1, padding: '0.8rem', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                <Download size={16} /> Download
                            </button>
                            <button 
                                onClick={() => { setShowReceipt(false); setRecentOrder(null); }}
                                style={{ flex: 1, padding: '0.8rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== PER-ORDER RECEIPT MODAL (My Orders Tab) ===== */}
            {showOrderReceipt && orderReceiptData && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}
                    onClick={() => { setShowOrderReceipt(false); setOrderReceiptData(null); }}
                >
                    <div
                        style={{ background: '#fff', color: '#1a1a1a', padding: '2rem', borderRadius: '16px', maxWidth: '420px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <FileText size={28} color="#3b82f6" />
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1a1a1a' }}>Booking Receipt</h2>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Order #{orderReceiptData.orderId?.toString().slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowOrderReceipt(false); setOrderReceiptData(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.25rem' }}>
                                <X size={22} />
                            </button>
                        </div>

                        {/* Receipt body */}
                        <div style={{ borderTop: '2px dashed #e2e8f0', borderBottom: '2px dashed #e2e8f0', padding: '1.25rem 0', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
                            {[
                                ['Service / Item', orderReceiptData.item],
                                ['Vendor', orderReceiptData.vendor],
                                ['Booking Date', orderReceiptData.bookingDate || '—'],
                                ['Booking Time', orderReceiptData.bookingTime || '—'],
                                ['Quantity', orderReceiptData.quantity],
                                ['Payment Method', orderReceiptData.paymentMethod],
                                ['Payment Status', orderReceiptData.paymentStatus],
                                ['Order Status', orderReceiptData.status],
                                ['Placed On', new Date(orderReceiptData.createdAt).toLocaleDateString()]
                            ].map(([label, val]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                    <span style={{ color: '#64748b' }}>{label}</span>
                                    <span style={{ fontWeight: '600', maxWidth: '55%', textAlign: 'right' }}>{val}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Total Amount</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>${orderReceiptData.totalAmount?.toFixed(2)}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => handleDownloadReceipt(orderReceiptData)}
                                style={{ flex: 1, padding: '0.8rem', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                <Download size={16} /> Download
                            </button>
                            <button
                                onClick={() => { setShowOrderReceipt(false); setOrderReceiptData(null); }}
                                style={{ flex: 1, padding: '0.8rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default UserDashboardNew;
