import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import Alert from '../components/Alert';
import ItemListingNew from './ItemListingNew';
import { Plus, Package, ClipboardList, LogOut, TrendingUp, DollarSign, Users, User, AlertCircle, Clock, CheckCircle, Store, Home, Car, Search, ShieldCheck, MapPin, Phone, Building2, Calendar, FileText, CreditCard, X, Download, Loader, Tag, Wrench } from 'lucide-react';
import bgImage from '../images/feature-1.jpg';



const VendorDashboard = () => {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useAuth();
    const [items, setItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [newItem, setNewItem] = useState({
        name: '',
        description: '',
        price: '',
        category: 'SERVICE',
        stock: 1,
        imageUrl: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        transmission: 'MANUAL',
        fuelType: 'PETROL',
        mileage: '',
        seatCount: 4,
        condition: 'NEW',
        duration: '',
        warranty: '',
        color: '',
        vin: '',
        engineCapacity: '',
        features: '',
        previousOwners: 0,
        vehicleType: 'CAR'
    });
    const [listingTemplate, setListingTemplate] = useState('service'); // 'showroom', 'service', 'second_vehicle'
    const [vendorProfile, setVendorProfile] = useState({
        companyName: '',
        description: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        vendorType: 'REPAIR',
        subCategory: 'GENERAL_SERVICE'
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedTier, setSelectedTier] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [selectedOrderReceipt, setSelectedOrderReceipt] = useState(null);
    const [plans, setPlans] = useState([]);
    const [mySubscriptions, setMySubscriptions] = useState([]);
    const [daysRemaining, setDaysRemaining] = useState(null);
    const [subscriptionStep, setSubscriptionStep] = useState(1); // 1: Select Payment, 2: Success Notification
    const [isUploading, setIsUploading] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const fileInputRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    useEffect(() => {
        fetchVendorData();
    }, []);

    // Sync vendorProfile state whenever user data changes
    useEffect(() => {
        if (user?.vendor) {
            setVendorProfile(prev => ({
                ...prev,
                companyName: user.vendor.companyName || '',
                description: user.vendor.description || '',
                phone: user.vendor.phone || '',
                address: user.vendor.address || '',
                city: user.vendor.city || '',
                state: user.vendor.state || '',
                zipCode: user.vendor.zipCode || '',
                vendorType: user.vendor.vendorType || 'REPAIR',
                subCategory: user.vendor.subCategory || 'GENERAL_SERVICE'
            }));
        }
    }, [user]);

    const fetchVendorData = async () => {
        try {
            const [itemsRes, ordersRes, profileRes, plansRes, subsRes] = await Promise.all([
                api.get('/items/vendor/my-items'),
                api.get('/orders/vendor/my-orders'),
                api.get('/auth/profile'),
                api.get('/plans'),
                api.get('/subscriptions/my')
            ]);
            setItems(itemsRes.data.items || []);
            setOrders(ordersRes.data.orders || []);
            setPlans(plansRes.data || []);
            setMySubscriptions(subsRes.data || []);
            
            // Update global user state with latest profile (includes approval status)
            if (profileRes.data) {
                updateUser(profileRes.data);
                
                // Calculate days remaining
                if (profileRes.data.vendor?.subscriptionExpiry) {
                    const expiry = new Date(profileRes.data.vendor.subscriptionExpiry);
                    const now = new Date();
                    const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
                    setDaysRemaining(diff > 0 ? diff : 0);
                }
            }
            
            if (profileRes.data.vendor) {
                setVendorProfile({
                    companyName: profileRes.data.vendor.companyName || '',
                    description: profileRes.data.vendor.description || '',
                    phone: profileRes.data.vendor.phone || '',
                    address: profileRes.data.vendor.address || '',
                    city: profileRes.data.vendor.city || '',
                    state: profileRes.data.vendor.state || '',
                    zipCode: profileRes.data.vendor.zipCode || '',
                    vendorType: profileRes.data.vendor.vendorType || 'REPAIR',
                    subCategory: profileRes.data.vendor.subCategory || 'GENERAL_SERVICE'
                });
            }
        } catch (error) {
            setError('Failed to fetch vendor data');
            console.error('Error fetching vendor data', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccess('');
        try {
            await api.put('/auth/profile', vendorProfile);
            const significantChange = 
                vendorProfile.companyName !== user?.vendor?.companyName ||
                vendorProfile.description !== user?.vendor?.description ||
                vendorProfile.address !== user?.vendor?.address ||
                vendorProfile.city !== user?.vendor?.city ||
                vendorProfile.state !== user?.vendor?.state ||
                vendorProfile.zipCode !== user?.vendor?.zipCode;
                
            setSuccess(significantChange 
                ? 'Business profile updated and submitted for re-approval.' 
                : 'Profile updated successfully.');
            
            // Immediately sync with global state
            updateUser({ vendor: { ...user.vendor, ...vendorProfile } });
            
            fetchVendorData();
            setIsEditingProfile(false);
            setTimeout(() => setSuccess(''), 5000);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a valid image file (JPG, PNG, WEBP)');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        setIsUploading(true);
        setError('');
        try {
            const { data } = await api.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Update the newItem state with the local path returned by server
            // Ensure we use the full backend URL for previewing
            const fullUrl = `${api.defaults.baseURL.replace('/api', '')}${data.imageUrl}`;
            setNewItem(prev => ({ ...prev, imageUrl: fullUrl }));
            setSuccess('Image uploaded successfully from gallery!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            await api.post('/items', newItem);
            setSuccess('Item added successfully');
            setShowAddForm(false);
            setNewItem({ 
                name: '', description: '', price: '', category: 'SERVICE', stock: 1,
                imageUrl: '',
                brand: '', model: '', year: new Date().getFullYear(), transmission: 'MANUAL',
                fuelType: 'PETROL', mileage: '', seatCount: 4,
                condition: 'NEW', duration: '', warranty: '', color: '', vin: '',
                engineCapacity: '', features: '', previousOwners: 0, vehicleType: 'CAR'
            });
            // Reset template based on vendor type
            if (user?.vendor?.vendorType === 'VEHICLE_SALES') {
                setListingTemplate(user.vendor.subCategory === 'NEW_CARS' ? 'showroom' : 'second_vehicle');
            } else {
                setListingTemplate('service');
            }
            fetchVendorData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add item');
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await api.delete(`/items/${itemId}`);
                setSuccess('Item deleted successfully');
                fetchVendorData();
                setTimeout(() => setSuccess(''), 3000);
            } catch (error) {
                setError('Failed to delete item');
            }
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status });
            setSuccess('Order status updated');
            fetchVendorData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError('Failed to update status');
        }
    };

    const getStats = () => {
        const completedOrders = orders.filter(o => o.status === 'COMPLETED');
        const revenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const pendingOrders = orders.filter(o => ['CREATED', 'ACCEPTED', 'IN_PROGRESS', 'PENDING', 'SHIPPED'].includes(o.status)).length;
        
        return {
            revenue,
            pendingOrders,
            totalItems: items.length,
            totalOrders: orders.length,
            completedOrders: completedOrders.length
        };
    };

    const stats = getStats();

    const handleFinalizeSubscription = async () => {
        if (!paymentMethod) {
            setError('Please select a payment method');
            return;
        }

        setIsSaving(true);
        setError('');
        
        try {
            const selectedPlan = plans.find(p => p._id === selectedTier);
            
            const { data } = await api.post('/subscriptions', { 
                planId: selectedTier,
                paymentMethod 
            });
            
            setReceiptData({
                transactionId: data.subscription.transactionId,
                date: data.subscription.startDate,
                plan: data.subscription.plan.name,
                paymentMethod: data.subscription.paymentMethod,
                amount: data.subscription.amount
            });

            setSubscriptionStep(2); // Show Success State
            
            // Wait for 2 seconds to show the success message before showing receipt
            setTimeout(() => {
                setShowPaymentModal(false);
                setShowReceipt(true);
                setSubscriptionStep(1);
                setPaymentMethod('');
                fetchVendorData();
            }, 2000);

        } catch (error) {
            setError(error.response?.data?.message || 'Failed to subscribe');
            setShowPaymentModal(true); // Ensure modal stays open if failed
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDownloadReceipt = (data, title = 'Receipt') => {
        if (!data) return;
        const content = `
------------------------------------------
         ${title.toUpperCase()}
------------------------------------------
Date: ${new Date(data.date || data.createdAt || new Date()).toLocaleString()}
Transaction ID: ${data.transactionId || data._id || 'N/A'}
Plan/Service: ${data.plan || data.name || (data.item?.name) || 'Service'}
Amount: $${((data.amount || data.totalAmount || 0)).toFixed(2)}
Payment Method: ${data.paymentMethod || 'N/A'}
------------------------------------------
Thank you for using FleetOps!
------------------------------------------
        `;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_${data.transactionId || data._id || 'file'}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="dashboard-bg">

            <div className="dash-layout">
            <aside className="dash-sidebar">
                <div className="dash-sidebar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', marginBottom: '2rem' }}>
                        <Car size={32} />
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{user?.vendor?.companyName || 'FleetOps'}</span>
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
                        className={`dash-sidebar-btn ${activeTab === 'items' ? 'active' : ''}`}
                        onClick={() => setActiveTab('items')}
                    >
                        <Package size={20} /> <span>Products</span>
                    </button>
                    <button 
                        className={`dash-sidebar-btn ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <ClipboardList size={20} /> <span>Orders</span>
                    </button>
                    <button 
                        className={`dash-sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User size={20} /> <span>Business Profile</span>
                    </button>
                    <button 
                        className={`dash-sidebar-btn ${activeTab === 'subscription' ? 'active' : ''}`}
                        onClick={() => setActiveTab('subscription')}
                    >
                        <ShieldCheck size={20} /> <span>Subscription</span>
                    </button>
                </div>

                <div className="dash-sidebar-footer">
                    <div style={{ padding: '0 0.5rem 1rem 0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ 
                                width: '36px', 
                                height: '36px', 
                                borderRadius: '50%', 
                                backgroundColor: 'var(--success)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold'
                            }}>
                                {user?.name?.charAt(0) || 'V'}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name}</p>
                                <span style={{ 
                                    fontSize: '0.75rem', 
                                    color: 'var(--success)', 
                                    backgroundColor: 'rgba(34, 197, 94, 0.1)', 
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
                        <h1 style={{ margin: 0, fontSize: '1.75rem' }}>{user?.vendor?.companyName || 'Business Dashboard'}</h1>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--success)', fontWeight: 'bold', letterSpacing: '1px', fontSize: '0.7rem' }}>📍 SAVED IN VENDOR DATABASE</p>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8' }}>Manage your products and service listings</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
                    <div className="card" style={{ borderLeft: '4px solid var(--primary)', background: 'var(--dark-card)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Total Revenue</p>
                                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>${(stats.revenue || 0).toFixed(2)}</p>
                            </div>
                            <DollarSign size={32} style={{ color: 'var(--primary)', opacity: 0.5 }} />
                        </div>
                    </div>

                    <div className="card" style={{ borderLeft: '4px solid var(--success)', background: 'var(--dark-card)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Completed Orders</p>
                                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{stats.completedOrders}</p>
                            </div>
                            <Package size={32} style={{ color: 'var(--success)', opacity: 0.5 }} />
                        </div>
                    </div>

                    <div className="card" style={{ borderLeft: '4px solid var(--warning)', background: 'var(--dark-card)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Pending Orders</p>
                                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{stats.pendingOrders}</p>
                            </div>
                            <Clock size={32} style={{ color: 'var(--warning)', opacity: 0.5 }} />
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="card" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{user?.vendor?.companyName || 'Business'} Overview</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            <div style={{ padding: '1.5rem', background: '#1a1a1a', borderRadius: '12px', border: '1px solid #333' }}>
                                <h3 style={{ margin: 0, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Order Success Rate</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ flex: 1, background: '#333', height: '12px', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ background: '#10b981', height: '100%', width: `${stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders * 100) : 0}%` }}></div>
                                    </div>
                                    <strong style={{ color: '#10b981' }}>{stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders * 100).toFixed(0) : 0}%</strong>
                                </div>
                            </div>
                            <div style={{ padding: '1.5rem', background: '#1a1a1a', borderRadius: '12px', border: '1px solid #333' }}>
                                <h3 style={{ margin: 0, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Product Statistics</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#94a3b8' }}>Listed Products</span>
                                    <strong style={{ color: '#fff' }}>{items.length}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'items' && (
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>Product Catalog</h2>
                                <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                                    {user?.vendor?.vendorType === 'VEHICLE_SALES' ? '🚗 Vehicle Sales listings' : '🔧 Repair & Service listings'}
                                </p>
                            </div>
                            <button onClick={() => setShowAddForm(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Plus size={18} /> Add New Item
                            </button>
                        </div>
                        
                        {showAddForm && (
                            <form onSubmit={handleAddItem} style={{ marginBottom: '2.5rem', padding: '1.5rem', background: '#252525', borderRadius: '12px', border: '1px solid #333' }}>
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '1rem', color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>Type of Listing</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setListingTemplate('showroom');
                                                setNewItem({...newItem, category: 'CAR', condition: 'NEW'});
                                            }}
                                            style={{
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                border: '2px solid',
                                                borderColor: listingTemplate === 'showroom' ? 'var(--primary)' : '#333',
                                                background: listingTemplate === 'showroom' ? 'rgba(59, 130, 246, 0.1)' : '#1a1a1a',
                                                color: listingTemplate === 'showroom' ? '#fff' : '#94a3b8',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <Car size={24} />
                                            <span style={{ fontWeight: '600' }}>Showroom</span>
                                            <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>New Vehicles</span>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setListingTemplate('second_vehicle');
                                                setNewItem({...newItem, category: 'CAR', condition: 'USED'});
                                            }}
                                            style={{
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                border: '2px solid',
                                                borderColor: listingTemplate === 'second_vehicle' ? '#f59e0b' : '#333',
                                                background: listingTemplate === 'second_vehicle' ? 'rgba(245, 158, 11, 0.1)' : '#1a1a1a',
                                                color: listingTemplate === 'second_vehicle' ? '#fff' : '#94a3b8',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <Tag size={24} />
                                            <span style={{ fontWeight: '600' }}>Second Vehicle</span>
                                            <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Pre-owned</span>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setListingTemplate('service');
                                                setNewItem({...newItem, category: 'SERVICE'});
                                            }}
                                            style={{
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                border: '2px solid',
                                                borderColor: listingTemplate === 'service' ? '#10b981' : '#333',
                                                background: listingTemplate === 'service' ? 'rgba(16, 185, 129, 0.1)' : '#1a1a1a',
                                                color: listingTemplate === 'service' ? '#fff' : '#94a3b8',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <Wrench size={24} />
                                            <span style={{ fontWeight: '600' }}>Service</span>
                                            <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Repairs & Maint.</span>
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Item Name / Title</label>
                                        <input required className="form-control" style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #444' }} value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder={listingTemplate === 'service' ? "e.g. Engine Oil Change" : "e.g. 2024 Toyota Camry Platinum"} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Vehicle Type</label>
                                        <select className="form-control" style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #444' }} value={newItem.vehicleType} onChange={e => setNewItem({...newItem, vehicleType: e.target.value})}>
                                            <option value="CAR">🚗 Car</option>
                                            <option value="BIKE">🏍️ Bike</option>
                                            <option value="TRUCK">🚛 Truck</option>
                                            <option value="BUS">🚌 Bus</option>
                                            <option value="OTHER">🚛 Other</option>
                                        </select>
                                    </div>
                                </div>

                                {/* SERVICE TEMPLATE FIELDS */}
                                {listingTemplate === 'service' && (
                                    <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #444' }}>
                                        <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#10b981' }}>Service Specifications</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>Estimated Duration</label>
                                                <input className="form-control" placeholder="e.g. 2-3 hours" value={newItem.duration} onChange={e => setNewItem({...newItem, duration: e.target.value})} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>Service Warranty</label>
                                                <input className="form-control" placeholder="e.g. 6 months / 10,000km" value={newItem.warranty} onChange={e => setNewItem({...newItem, warranty: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* SHOWROOM TEMPLATE FIELDS */}
                                {listingTemplate === 'showroom' && (
                                    <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #444' }}>
                                        <h4 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--primary)' }}>New Vehicle Details</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>Brand</label>
                                                <input className="form-control" placeholder="Toyota" value={newItem.brand} onChange={e => setNewItem({...newItem, brand: e.target.value})} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>Model</label>
                                                <input className="form-control" placeholder="Camry 2024" value={newItem.model} onChange={e => setNewItem({...newItem, model: e.target.value})} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>Color</label>
                                                <input className="form-control" placeholder="Pearl White" value={newItem.color} onChange={e => setNewItem({...newItem, color: e.target.value})} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>Transmission</label>
                                                <select className="form-control" value={newItem.transmission} onChange={e => setNewItem({...newItem, transmission: e.target.value})}>
                                                    <option value="AUTOMATIC">Automatic</option>
                                                    <option value="MANUAL">Manual</option>
                                                    <option value="SEMI-AUTOMATIC">Semi-Automatic</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>Fuel Type</label>
                                                <select className="form-control" value={newItem.fuelType} onChange={e => setNewItem({...newItem, fuelType: e.target.value})}>
                                                    <option value="PETROL">Petrol</option>
                                                    <option value="DIESEL">Diesel</option>
                                                    <option value="ELECTRIC">Electric</option>
                                                    <option value="HYBRID">Hybrid</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>Year</label>
                                                <input type="number" className="form-control" value={newItem.year} onChange={e => setNewItem({...newItem, year: e.target.value})} />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>Key Features (Flagship)</label>
                                            <textarea className="form-control" style={{ minHeight: '60px' }} placeholder="Sunroof, 360 Camera, Leather Seats..." value={newItem.features} onChange={e => setNewItem({...newItem, features: e.target.value})} />
                                        </div>
                                    </div>
                                )}

                                {/* SECOND VEHICLE TEMPLATE FIELDS */}
                                {listingTemplate === 'second_vehicle' && (
                                    <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #444' }}>
                                        <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#f59e0b' }}>Pre-owned Vehicle Details</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>Brand/Model</label>
                                                <input className="form-control" placeholder="Honda Civic" value={newItem.model} onChange={e => setNewItem({...newItem, model: e.target.value})} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>Year</label>
                                                <input type="number" className="form-control" value={newItem.year} onChange={e => setNewItem({...newItem, year: e.target.value})} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>Mileage (km)</label>
                                                <input type="number" className="form-control" value={newItem.mileage} onChange={e => setNewItem({...newItem, mileage: e.target.value})} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>Condition</label>
                                                <select className="form-control" value={newItem.condition} onChange={e => setNewItem({...newItem, condition: e.target.value})}>
                                                    <option value="USED">Used / Excellent</option>
                                                    <option value="NEW">Near New</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>Owners</label>
                                                <input type="number" className="form-control" placeholder="1" value={newItem.previousOwners} onChange={e => setNewItem({...newItem, previousOwners: e.target.value})} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>Warranty</label>
                                                <input className="form-control" placeholder="3 Months" value={newItem.warranty} onChange={e => setNewItem({...newItem, warranty: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Price ($)</label>
                                        <input type="number" required className="form-control" style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #444' }} value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Stock</label>
                                        <input type="number" className="form-control" style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #444' }} value={newItem.stock} onChange={e => setNewItem({...newItem, stock: e.target.value})} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Item Image</label>
                                    
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div style={{ 
                                            width: '120px', 
                                            height: '100px', 
                                            borderRadius: '12px', 
                                            background: '#1a1a1a', 
                                            border: '1px solid #333',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            flexShrink: 0
                                        }}>
                                            {newItem.imageUrl ? (
                                                <img src={newItem.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ opacity: 0.2 }}>
                                                    {newItem.category === 'CAR' ? <Car size={40} /> : <Package size={40} />}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div style={{ flex: 1 }}>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                ref={fileInputRef}
                                                onChange={handleFileUpload}
                                                style={{ display: 'none' }}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => fileInputRef.current.click()}
                                                disabled={isUploading}
                                                className="btn btn-outline"
                                                style={{ width: '100%', marginBottom: '0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                            >
                                                {isUploading ? <><Loader className="spin" size={16} /> Uploading...</> : <><Search size={16} /> Select from Gallery</>}
                                            </button>
                                            
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>— OR —</p>
                                            
                                            <input 
                                                className="form-control" 
                                                style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #444', marginTop: '0.75rem', fontSize: '0.85rem' }} 
                                                placeholder="Paste Image URL here..." 
                                                value={newItem.imageUrl} 
                                                onChange={e => setNewItem({...newItem, imageUrl: e.target.value})} 
                                            />
                                        </div>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Upload a photo or paste a direct link to an image.</p>
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Description</label>
                                    <textarea className="form-control" style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #444', minHeight: '80px' }} value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="btn btn-primary">Save Product</button>
                                    <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-outline">Cancel</button>
                                </div>
                            </form>
                        )}

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #333' }}>
                                        <th style={{ padding: '1rem', color: '#94a3b8' }}>Item</th>
                                        <th style={{ padding: '1rem', color: '#94a3b8' }}>Category</th>
                                        <th style={{ padding: '1rem', color: '#94a3b8' }}>Price</th>
                                        <th style={{ padding: '1rem', color: '#94a3b8', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <tr key={item._id} style={{ borderBottom: '1px solid #2d2d2d' }}>
                                            <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Package size={20} color="#666" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: '500', color: '#fff' }}>{item.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                                                        {item.brand || item.model ? `${item.brand || ''} ${item.model || ''}`.trim() : ''}
                                                        {(item.brand || item.model) && item.year ? ` (${item.year})` : ''}
                                                        {item.mileage && ` · ${item.mileage.toLocaleString()} km`}
                                                        {item.duration && ` · ${item.duration}`}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ 
                                                    padding: '0.2rem 0.5rem', 
                                                    borderRadius: '4px', 
                                                    fontSize: '0.7rem', 
                                                    fontWeight: 'bold',
                                                    background: item.category === 'SERVICE' || item.category === 'REPAIR' 
                                                        ? 'rgba(16, 185, 129, 0.1)' 
                                                        : item.condition === 'NEW' 
                                                            ? 'rgba(59, 130, 246, 0.1)' 
                                                            : 'rgba(245, 158, 11, 0.1)',
                                                    color: item.category === 'SERVICE' || item.category === 'REPAIR' 
                                                        ? '#10b981' 
                                                        : item.condition === 'NEW' 
                                                            ? '#60a5fa' 
                                                            : '#f59e0b'
                                                }}>
                                                    {item.category === 'SERVICE' || item.category === 'REPAIR' 
                                                        ? 'Service' 
                                                        : item.condition === 'NEW' 
                                                            ? 'Showroom' 
                                                            : 'Second Vehicle'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', fontWeight: 'bold', color: '#fff' }}>${item.price.toLocaleString()}</td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <button onClick={() => handleDeleteItem(item._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Recent Orders</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #333' }}>
                                        <th style={{ padding: '1rem', color: '#94a3b8' }}>Order</th>
                                        <th style={{ padding: '1rem', color: '#94a3b8' }}>Customer</th>
                                        <th style={{ padding: '1rem', color: '#94a3b8' }}>Booking For</th>
                                        <th style={{ padding: '1rem', color: '#94a3b8' }}>Total</th>
                                        <th style={{ padding: '1rem', color: '#94a3b8' }}>Status</th>
                                        <th style={{ padding: '1rem', color: '#94a3b8', textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order._id} style={{ borderBottom: '1px solid #2d2d2d' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: '500', color: '#fff' }}>{order.item?.name}</div>
                                            </td>
                                            <td style={{ padding: '1rem', color: '#94a3b8' }}>{order.user?.name}</td>
                                            <td style={{ padding: '1rem', color: '#fff' }}>
                                                {order.bookingDate ? (
                                                    <div style={{ fontSize: '0.85rem' }}>
                                                        <div style={{ fontWeight: '600' }}>{order.bookingDate}</div>
                                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>at {order.bookingTime}</div>
                                                    </div>
                                                ) : '—'}
                                            </td>
                                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>${order.totalAmount?.toFixed(2)}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ 
                                                    padding: '0.25rem 0.5rem', 
                                                    borderRadius: '4px', 
                                                    fontSize: '0.75rem',
                                                    background: order.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                    color: order.status === 'COMPLETED' ? '#10b981' : '#f59e0b'
                                                }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                {!['COMPLETED', 'CANCELLED', 'REJECTED'].includes(order.status) && (
                                                    <select 
                                                        value={order.status} 
                                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                        style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #444', padding: '0.25rem', borderRadius: '4px' }}
                                                    >
                                                        <option value="CREATED">Created</option>
                                                        <option value="ACCEPTED">Accept</option>
                                                        <option value="IN_PROGRESS">Process</option>
                                                        <option value="COMPLETED">Complete</option>
                                                        <option value="CANCELLED">Cancel</option>
                                                    </select>
                                                )}
                                                <button 
                                                    onClick={() => setSelectedOrderReceipt(order)}
                                                    style={{ background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', marginLeft: '0.5rem' }}
                                                >
                                                    Receipt
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0 }}>Business Profile</h2>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                {user?.vendor?.approved ? (
                                    <span style={{ padding: '0.4rem 0.8rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <ShieldCheck size={16} /> Approved
                                    </span>
                                ) : (
                                    <span style={{ padding: '0.4rem 0.8rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={16} /> Pending Approval
                                    </span>
                                )}
                                {!isEditingProfile && user?.vendor?.businessProfileSubmitted && (
                                    <button 
                                        onClick={() => setIsEditingProfile(true)} 
                                        className="btn btn-outline" 
                                        style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        <FileText size={16} /> Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>

                        {!isEditingProfile && user?.vendor?.businessProfileSubmitted ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '16px', border: '1px solid #333' }}>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
                                        <Building2 size={24} /> {vendorProfile.companyName}
                                    </h3>
                                    <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                                        "{vendorProfile.description}"
                                    </p>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        <div style={{ margin: '0 0 0.5rem 0', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.1)', fontSize: '0.8rem', color: '#60a5fa' }}>
                                            <ShieldCheck size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> 
                                            Private Info: Only visible to platform administrators for verification.
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff' }}>
                                            <Phone size={18} color="#94a3b8" /> {vendorProfile.phone}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#fff' }}>
                                            <MapPin size={18} color="#94a3b8" />
                                            <div>
                                                <div>{vendorProfile.address}</div>
                                                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{vendorProfile.city}, {vendorProfile.state} {vendorProfile.zipCode}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '16px', border: '1px solid #333' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#fff' }}>Business Categories</h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        <span style={{ padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}>
                                            {vendorProfile.vendorType === 'REPAIR' ? '🔧 Repair & Service' : '🚗 Vehicle Sales'}
                                        </span>
                                        <span style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: '8px', fontSize: '0.85rem' }}>
                                            {vendorProfile.subCategory.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                        <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Platform Visibility</div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                                            {user?.vendor?.approved ? 'Your business is active and visible in the marketplace.' : 'Your profile is awaiting verification by our team.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateProfile}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Building2 size={20} color="var(--primary)" /> Business Details
                                        </h3>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Vendor Type</label>
                                            <select
                                                className="form-control"
                                                style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333' }}
                                                value={vendorProfile.vendorType}
                                                onChange={e => {
                                                    const type = e.target.value;
                                                    setVendorProfile({
                                                        ...vendorProfile, 
                                                        vendorType: type,
                                                        subCategory: type === 'REPAIR' ? 'GENERAL_SERVICE' : 'NEW_CARS'
                                                    });
                                                }}
                                            >
                                                <option value="REPAIR">🔧 Repair Vendor (Vehicle Repairs & Services)</option>
                                                <option value="VEHICLE_SALES">🚗 Vehicle Sales (New & Second-Hand Cars)</option>
                                            </select>
                                        </div>

                                        {vendorProfile.vendorType === 'VEHICLE_SALES' && (
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Vehicle Strategy</label>
                                                <select
                                                    className="form-control"
                                                    style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333' }}
                                                    value={vendorProfile.subCategory}
                                                    onChange={e => setVendorProfile({...vendorProfile, subCategory: e.target.value})}
                                                >
                                                    <option value="NEW_CARS">✨ Sell New Cars</option>
                                                    <option value="USED_CARS">🚗 Sell Used Cars</option>
                                                </select>
                                            </div>
                                        )}
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Company Name</label>
                                            <input 
                                                required 
                                                className="form-control" 
                                                style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333' }} 
                                                value={vendorProfile.companyName} 
                                                onChange={e => setVendorProfile({...vendorProfile, companyName: e.target.value})} 
                                            />
                                        </div>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Contact Phone</label>
                                            <input 
                                                required 
                                                className="form-control" 
                                                style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333' }} 
                                                value={vendorProfile.phone} 
                                                onChange={e => setVendorProfile({...vendorProfile, phone: e.target.value})} 
                                            />
                                        </div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Business Description</label>
                                            <textarea 
                                                required 
                                                className="form-control" 
                                                style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333', minHeight: '120px' }} 
                                                value={vendorProfile.description} 
                                                onChange={e => setVendorProfile({...vendorProfile, description: e.target.value})} 
                                                placeholder="Tell us about your services..."
                                            />
                                    </div>

                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <MapPin size={20} color="var(--primary)" /> Location Info
                                        </h3>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Street Address</label>
                                            <input 
                                                className="form-control" 
                                                style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333' }} 
                                                value={vendorProfile.address} 
                                                onChange={e => setVendorProfile({...vendorProfile, address: e.target.value})} 
                                            />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>City</label>
                                                <input 
                                                    className="form-control" 
                                                    style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333' }} 
                                                    value={vendorProfile.city} 
                                                    onChange={e => setVendorProfile({...vendorProfile, city: e.target.value})} 
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>State/Province</label>
                                                <input 
                                                    className="form-control" 
                                                    style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333' }} 
                                                    value={vendorProfile.state} 
                                                    onChange={e => setVendorProfile({...vendorProfile, state: e.target.value})} 
                                                />
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Zip/Postal Code</label>
                                            <input 
                                                className="form-control" 
                                                style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333' }} 
                                                value={vendorProfile.zipCode} 
                                                onChange={e => setVendorProfile({...vendorProfile, zipCode: e.target.value})} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ 
                                    borderTop: '1px solid #333', 
                                    paddingTop: '2rem', 
                                    display: 'flex', 
                                    justifyContent: 'flex-end',
                                    gap: '1rem' 
                                }}>
                                    {user?.vendor?.businessProfileSubmitted && (
                                        <button type="button" onClick={() => setIsEditingProfile(false)} className="btn btn-outline" style={{ minWidth: '120px' }}>
                                            Cancel
                                        </button>
                                    )}
                                    <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ minWidth: '200px' }}>
                                        {isSaving ? 'Submitting...' : (user?.vendor?.businessProfileSubmitted ? 'Update & Re-submit' : 'Save & Submit for Approval')}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {activeTab === 'marketplace' && (
                    <div style={{ marginTop: '-2rem' }}>
                        <ItemListingNew />
                    </div>
                )}
                {/* Subscription Management */}
                {activeTab === 'subscription' && (
                    <div className="card" style={{ padding: '2.5rem' }}>
                        {/* Receipt View */}
                        {showReceipt && receiptData && (
                            <div style={{ 
                                position: 'fixed', 
                                top: 0, 
                                left: 0, 
                                right: 0, 
                                bottom: 0, 
                                background: 'rgba(0,0,0,0.85)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                zIndex: 1000,
                                padding: '1rem'
                            }}>
                                <div style={{ 
                                    background: '#fff', 
                                    color: '#1a1a1a', 
                                    padding: '2.5rem', 
                                    borderRadius: '12px', 
                                    maxWidth: '450px', 
                                    width: '100%', 
                                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' 
                                }}>
                                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                        <div style={{ color: '#10b981', marginBottom: '1rem' }}>
                                            <ShieldCheck size={48} style={{ margin: '0 auto' }} />
                                        </div>
                                        <h2 style={{ margin: 0, color: '#1a1a1a' }}>Payment Receipt</h2>
                                        <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>Thank you for your business!</p>
                                    </div>

                                    <div style={{ borderTop: '1px dashed #e2e8f0', borderBottom: '1px dashed #e2e8f0', padding: '1.5rem 0', marginBottom: '2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <span style={{ color: '#64748b' }}>Transaction ID</span>
                                            <span style={{ fontWeight: '600' }}>#{receiptData.transactionId}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <span style={{ color: '#64748b' }}>Date</span>
                                            <span style={{ fontWeight: '600' }}>{new Date(receiptData.date).toLocaleDateString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <span style={{ color: '#64748b' }}>Plan</span>
                                            <span style={{ fontWeight: '600' }}>{receiptData.plan}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#64748b' }}>Payment Method</span>
                                            <span style={{ fontWeight: '600' }}>{receiptData.paymentMethod}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Total Paid</span>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a1a1a' }}>${receiptData.amount.toFixed(2)}</span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button 
                                            className="btn btn-primary" 
                                            style={{ flex: 1, background: '#1a1a1a', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                            onClick={() => handleDownloadReceipt(receiptData, 'Subscription Receipt')}
                                        >
                                            <Download size={18} /> Download
                                        </button>
                                        <button 
                                            className="btn btn-primary" 
                                            style={{ flex: 1, background: 'var(--primary)', border: 'none' }}
                                            onClick={() => setShowReceipt(false)}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Selection Modal */}
                        {showPaymentModal && (
                            <div style={{ 
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                                background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', 
                                justifyContent: 'center', zIndex: 1000 
                            }}>
                                <div className="card" style={{ maxWidth: '420px', width: '90%', padding: '2rem', background: '#1e1e1e', borderRadius: '20px', border: '1px solid #333' }}>
                                    
                                    {subscriptionStep === 1 && (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                <h3 style={{ margin: 0 }}>Secure Payment</h3>
                                                <button onClick={() => setShowPaymentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                                    <X size={20} />
                                                </button>
                                            </div>

                                            <div style={{ background: '#252525', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Selected Plan</p>
                                                <h3 style={{ margin: '0.25rem 0', color: '#fff' }}>{plans.find(p => p._id === selectedTier)?.name}</h3>
                                                <h2 style={{ margin: '0.25rem 0', color: '#10b981' }}>${plans.find(p => p._id === selectedTier)?.price}</h2>
                                            </div>

                                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: '600' }}>SELECT PAYMENT METHOD</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                                                {[
                                                    { id: 'Credit/Debit Card', icon: '💳', label: 'Credit/Debit Card' },
                                                    { id: 'UPI', icon: '📱', label: 'UPI Payment' },
                                                    { id: 'PayPal', icon: '🅿', label: 'PayPal' },
                                                    { id: 'Net Banking', icon: '🏦', label: 'Net Banking' }
                                                ].map(method => (
                                                    <label 
                                                        key={method.id}
                                                        style={{ 
                                                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', 
                                                            background: paymentMethod === method.id ? 'rgba(59, 130, 246, 0.1)' : '#1a1a1a',
                                                            border: `1px solid ${paymentMethod === method.id ? 'var(--primary)' : '#333'}`,
                                                            borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <input 
                                                            type="radio" name="payMethod" 
                                                            checked={paymentMethod === method.id}
                                                            onChange={() => setPaymentMethod(method.id)}
                                                            style={{ display: 'none' }}
                                                        />
                                                        <span style={{ fontSize: '1.2rem' }}>{method.icon}</span>
                                                        <span style={{ fontSize: '0.9rem', color: paymentMethod === method.id ? '#fff' : '#cbd5e1' }}>{method.label}</span>
                                                    </label>
                                                ))}
                                            </div>

                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button onClick={() => setShowPaymentModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                                                <button 
                                                    onClick={handleFinalizeSubscription} 
                                                    disabled={isSaving} 
                                                    className="btn btn-primary" 
                                                    style={{ flex: 2, opacity: isSaving ? 0.7 : 1 }}
                                                >
                                                    {isSaving ? 'Processing...' : 'Confirm & Pay'}
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    {subscriptionStep === 2 && (
                                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                                            <div style={{ 
                                                width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
                                            }}>
                                                <CheckCircle size={48} color="#10b981" />
                                            </div>
                                            <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Payment Successful!</h2>
                                            <p style={{ color: '#94a3b8' }}>Your business profile is now active on the platform. Generating receipt...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div style={{ 
                                width: '60px', 
                                height: '60px', 
                                borderRadius: '15px', 
                                background: 'rgba(59, 130, 246, 0.1)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: 'var(--primary)'
                            }}>
                                <ShieldCheck size={32} />
                            </div>
                            <div>
                                <h2 style={{ margin: 0 }}>Business Visibility</h2>
                                <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8' }}>Manage your platform subscription and reach more customers</p>
                            </div>
                        </div>

                        <div className="grid grid-2" style={{ gap: '2rem', marginBottom: '3rem' }}>
                            <div style={{ padding: '2rem', background: '#1a1a1a', borderRadius: '16px', border: '1px solid #333' }}>
                                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Clock size={20} color="var(--primary)" /> Current Status
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Vendor Dashboard</h1>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--success)', fontWeight: 'bold', letterSpacing: '1px', fontSize: '0.7rem' }}>📍 SAVED IN VENDOR DATABASE</p>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8' }}>Manage your products and service listings</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Business ID: {user?.vendor?._id}</div>
                        <div style={{ 
                            padding: '0.3rem 0.6rem', 
                            background: user?.vendor?.approved ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: user?.vendor?.approved ? '#22c55e' : '#f59e0b',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            display: 'inline-block'
                        }}>
                            {user?.vendor?.approved ? '✓ VERIFIED VENDOR' : '⌛ PENDING REVIEW'}
                        </div>
                    </div>
                </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#94a3b8' }}>Subscription</span>
                                        <span style={{ 
                                            padding: '0.4rem 1rem', 
                                            borderRadius: '20px', 
                                            fontSize: '0.8rem', 
                                            fontWeight: 'bold',
                                            background: user?.vendor?.isSubscribed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: user?.vendor?.isSubscribed ? '#10b981' : '#ef4444'
                                        }}>
                                            {user?.vendor?.isSubscribed ? 'SUBSCRIBED' : 'NOT SUBSCRIBED'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#94a3b8' }}>Active Tier</span>
                                        <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{user?.vendor?.subscriptionTier || 'NONE'}</span>
                                    </div>
                                    {user?.vendor?.isSubscribed && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                                                <Calendar size={16} /> Days Remaining
                                            </div>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{daysRemaining}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#94a3b8' }}>Visibility Status</span>
                                        <span style={{ 
                                            color: (user?.vendor?.isSubscribed && user?.vendor?.approved) ? '#10b981' : '#f59e0b',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            fontSize: '0.9rem'
                                        }}>
                                            {(user?.vendor?.isSubscribed && user?.vendor?.approved) ? <><CheckCircle size={14}/> Visible</> : <><Clock size={14}/> Hidden / Pending</>}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Boost Your Business</h3>
                                <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                    Keep your subscription active to stay visible in the marketplace and reach thousands of fleet owners.
                                </p>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={() => {
                                        const el = document.getElementById('available-plans');
                                        el?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    View Available Plans
                                </button>
                            </div>
                        </div>

                        <div id="available-plans" style={{ marginBottom: '4rem' }}>
                            <h3 style={{ marginBottom: '2rem', textAlign: 'center' }}>Available Subscription Plans</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                                {plans.filter(p => p.isActive).map(plan => (
                                    <div key={plan._id} className="card" style={{ 
                                        padding: '2rem', 
                                        background: '#1a1a1a', 
                                        border: plan.name === user?.vendor?.subscriptionTier ? '2px solid var(--primary)' : '1px solid #333',
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        {plan.name === user?.vendor?.subscriptionTier && (
                                            <span style={{ position: 'absolute', top: '-12px', right: '20px', padding: '4px 12px', background: 'var(--primary)', color: 'white', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>CURRENT PLAN</span>
                                        )}
                                        <h4 style={{ margin: 0, fontSize: '1.25rem' }}>{plan.name}</h4>
                                        <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                                            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>${plan.price}</span>
                                            <span style={{ color: '#94a3b8' }}>/ {plan.durationDays} Days</span>
                                        </div>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{plan.description}</p>
                                        <ul style={{ padding: 0, margin: '0 0 2rem 0', listStyle: 'none', display: 'grid', gap: '0.75rem', flex: 1 }}>
                                            {plan.features.map((f, i) => (
                                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                                                    <CheckCircle size={14} color="#10b981" /> {f}
                                                </li>
                                            ))}
                                        </ul>
                                        <button 
                                            className={(plan.name === user?.vendor?.subscriptionTier && user?.vendor?.isSubscribed) || mySubscriptions.some(s => (s.plan?._id === plan._id || s.plan === plan._id) && new Date(s.endDate) > new Date()) ? "btn btn-outline" : "btn btn-primary"}
                                            style={{ width: '100%' }}
                                            onClick={() => {
                                                const isActive = (plan.name === user?.vendor?.subscriptionTier && user?.vendor?.isSubscribed) || 
                                                               mySubscriptions.some(s => (s.plan?._id === plan._id || s.plan === plan._id) && new Date(s.endDate) > new Date());

                                                if (isActive) {
                                                    // Find the latest valid subscription for this plan in history
                                                    const latestSub = mySubscriptions.find(s => s.plan?._id === plan._id || s.plan === plan._id);
                                                    if (latestSub) {
                                                        setReceiptData({
                                                            transactionId: latestSub.transactionId,
                                                            date: latestSub.startDate,
                                                            plan: plan.name,
                                                            paymentMethod: latestSub.paymentMethod,
                                                            amount: latestSub.amount
                                                        });
                                                        setShowReceipt(true);
                                                    } else {
                                                        setSelectedTier(plan._id);
                                                        setSubscriptionStep(1);
                                                        setShowPaymentModal(true);
                                                    }
                                                } else {
                                                    setSelectedTier(plan._id);
                                                    setSubscriptionStep(1);
                                                    setShowPaymentModal(true);
                                                }
                                            }}
                                            disabled={isSaving}
                                        >
                                            {((plan.name === user?.vendor?.subscriptionTier && user?.vendor?.isSubscribed) || 
                                              mySubscriptions.some(s => (s.plan?._id === plan._id || s.plan === plan._id) && new Date(s.endDate) > new Date()))
                                                ? 'View Receipt' 
                                                : (plan.name === user?.vendor?.subscriptionTier ? 'Renew Plan' : 'Subscribe Now')}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #333', paddingTop: '3rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileText size={20} color="var(--primary)" /> Subscription History
                            </h3>
                            {mySubscriptions.length > 0 ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
                                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>Transaction ID</th>
                                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>Date</th>
                                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>Plan</th>
                                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>Amount</th>
                                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>Validity</th>
                                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mySubscriptions.map(sub => (
                                                <tr key={sub._id} style={{ borderBottom: '1px solid #222' }}>
                                                    <td style={{ padding: '1rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>{sub.transactionId}</td>
                                                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                                        <div>{new Date(sub.createdAt).toLocaleDateString()}</div>
                                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </td>
                                                    <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 'bold' }}>{sub.plan?.name}</td>
                                                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>${sub.amount}</td>
                                                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                                        {new Date(sub.startDate).toLocaleDateString()} - {new Date(sub.endDate).toLocaleDateString()}
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#10b981' }}>● {sub.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', background: '#1a1a1a', borderRadius: '12px', border: '1px solid #333' }}>
                                    <p style={{ color: '#94a3b8', margin: 0 }}>No subscription records found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                </div>
            </main>

            {/* ===== ORDER RECEIPT MODAL ===== */}
            {selectedOrderReceipt && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
                    <div style={{ background: '#fff', color: '#1a1a1a', padding: '2rem', borderRadius: '16px', maxWidth: '400px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                                <CheckCircle size={56} />
                            </div>
                            <h2 style={{ margin: 0, color: '#1a1a1a' }}>Booking Receipt</h2>
                            <p style={{ color: '#64748b', margin: '0.5rem 0' }}>Order Verification</p>
                        </div>
                        
                        <div style={{ borderTop: '1px dashed #e2e8f0', borderBottom: '1px dashed #e2e8f0', padding: '1.5rem 0', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ color: '#64748b' }}>Order ID</span>
                                <span style={{ fontWeight: '600' }}>#{selectedOrderReceipt._id?.slice(-8).toUpperCase()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ color: '#64748b' }}>Customer</span>
                                <span style={{ fontWeight: '600' }}>{selectedOrderReceipt.user?.name}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ color: '#64748b' }}>Service/Item</span>
                                <span style={{ fontWeight: '600' }}>{selectedOrderReceipt.item?.name}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ color: '#64748b' }}>Booking Date</span>
                                <span style={{ fontWeight: '600' }}>{selectedOrderReceipt.bookingDate}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ color: '#64748b' }}>Booking Time</span>
                                <span style={{ fontWeight: '600' }}>{selectedOrderReceipt.bookingTime}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748b' }}>Status</span>
                                <span style={{ fontWeight: '600', color: selectedOrderReceipt.status === 'COMPLETED' ? '#10b981' : '#f59e0b' }}>{selectedOrderReceipt.status}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <span style={{ fontWeight: 'bold' }}>Total Collected</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>${selectedOrderReceipt.totalAmount?.toFixed(2)}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button 
                                onClick={() => handleDownloadReceipt(selectedOrderReceipt, 'Booking Receipt')}
                                style={{ 
                                    flex: 1, padding: '1rem', background: '#f1f5f9', color: '#1a1a1a', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                }}
                            >
                                <Download size={18} /> Download
                            </button>
                            <button 
                                onClick={() => setSelectedOrderReceipt(null)}
                                style={{ 
                                    flex: 1, padding: '1rem', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer'
                                }}
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

export default VendorDashboard;
