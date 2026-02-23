// Direct Booking Flow - Updated
import React, { useEffect, useState } from 'react';
import api from '../api/api';
import Alert from '../components/Alert';
import { Search, CreditCard, Loader, ChevronLeft, ChevronRight, Filter, Star, Car, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ItemListingNew = ({ onBook }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchItems();
    }, [searchTerm, category, currentPage, limit]);

    const fetchItems = async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: limit,
                ...(searchTerm && { search: searchTerm }),
                ...(category && { category })
            });

            const { data } = await api.get(`/items?${params}`);
            setItems(data.items || []);
            setTotalPages(data.pagination?.pages || 1);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch items');
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchItems();
    };

    const categories = ['MAINTENANCE', 'REPAIR', 'SERVICE', 'CAR', 'OTHER'];

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Browse Marketplace</h2>
                {user && user.role === 'USER' && (
                    <button onClick={() => navigate('/user')} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>View My Orders</button>
                )}
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

            {/* Search Bar */}
            <form onSubmit={handleSearch} style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr 120px', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                    <input
                        type="text"
                        placeholder="Search items by name or description..."
                        className="form-control"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '45px', width: '100%', background: '#1e1e1e', border: '1px solid #333', color: '#fff' }}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Search</button>
            </form>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '2rem', background: '#1e1e1e', border: '1px solid #333' }}>
                <button onClick={() => setShowFilters(!showFilters)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#94a3b8' }}>
                    <Filter size={20} />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>

                {showFilters && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ color: '#94a3b8' }}>Category</label>
                            <select 
                                value={category} 
                                onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
                                style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ color: '#94a3b8' }}>Items Per Page</label>
                            <select 
                                value={limit} 
                                onChange={(e) => { setLimit(parseInt(e.target.value)); setCurrentPage(1); }}
                                style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>

                        {(searchTerm || category) && (
                            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <button
                                    onClick={() => { setSearchTerm(''); setCategory(''); setCurrentPage(1); }}
                                    className="btn btn-outline"
                                    style={{ width: '100%' }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Items Grid */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <Loader className="spin" size={40} color="var(--primary)" />
                </div>
            ) : items.length > 0 ? (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {items.map(item => {
                            const isPremium = item.vendor?.subscriptionTier === 'PREMIUM';
                            return (
                                <div 
                                    key={item._id} 
                                    className="card" 
                                    style={{ 
                                        background: '#1e1e1e', 
                                        border: isPremium ? '1px solid #f59e0b' : '1px solid #333', 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        position: 'relative',
                                        boxShadow: isPremium ? '0 0 15px rgba(245, 158, 11, 0.1)' : 'none',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {isPremium && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '-35px',
                                            background: '#f59e0b',
                                            color: '#000',
                                            padding: '4px 40px',
                                            fontSize: '0.65rem',
                                            fontWeight: 'bold',
                                            transform: 'rotate(45deg)',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                            zIndex: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px'
                                        }}>
                                            <Star size={10} fill="#000" /> FEATURED
                                        </div>
                                    )}

                                    {/* Item Image */}
                                    <div style={{ width: '100%', height: '180px', background: '#1a1a1a', position: 'relative', overflow: 'hidden' }}>
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                                                {item.category === 'CAR' ? <Car size={64} /> : <Package size={64} />}
                                            </div>
                                        )}
                                        <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
                                            <span style={{ 
                                                background: 'rgba(0,0,0,0.6)', color: '#fff', backdropFilter: 'blur(4px)',
                                                padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 'bold',
                                                border: '1px solid rgba(255,255,255,0.1)'
                                            }}>
                                                {item.category}
                                            </span>
                                            {item.vehicleType && (
                                                <span style={{ 
                                                    background: 'rgba(37, 99, 235, 0.6)', color: '#fff', backdropFilter: 'blur(4px)',
                                                    padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 'bold',
                                                    border: '1px solid rgba(255,255,255,0.1)', marginLeft: '0.5rem'
                                                }}>
                                                    {item.vehicleType}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <div>
                                                    <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.1rem', color: '#fff' }}>{item.name}</h3>
                                                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>
                                                        by {item.vendor?.companyName || 'Unknown Vendor'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                <p style={{ color: '#cbd5e1', marginBottom: '1.25rem', fontSize: '0.9rem', flexGrow: 1 }}>
                                    {item.description.length > 100 ? item.description.substring(0, 100) + '...' : item.description}
                                </p>

                                {item.category === 'CAR' && (
                                    <div style={{ 
                                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', 
                                        fontSize: '0.8rem', color: '#94a3b8', background: '#252525',
                                        padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem'
                                    }}>
                                        <div>Model: {item.model}</div>
                                        <div>Year: {item.year}</div>
                                        <div style={{ gridColumn: 'span 2' }}>Fuel: {item.fuelType} | {item.transmission}</div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                                        ${item.price.toFixed(2)}
                                    </span>
                                    {item.stock && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Stock: {item.stock}</span>}
                                </div>

                                {item.available ? (
                                    <button
                                        onClick={() => onBook(item)}
                                        className="btn btn-primary"
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <CreditCard size={18} />
                                        Book / Pay Now
                                    </button>
                                ) : (
                                    <button className="btn btn-outline" disabled style={{ width: '100%', opacity: '0.5' }}>
                                        Out of Stock
                                    </button>
                                )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2.5rem' }}>
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn btn-outline"><ChevronLeft size={20} /></button>
                            <span style={{ color: '#94a3b8' }}>Page {currentPage} of {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn btn-outline"><ChevronRight size={20} /></button>
                        </div>
                    )}
                </>
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: '4rem', background: '#1e1e1e' }}>
                    <Search size={48} style={{ color: '#333', marginBottom: '1.5rem' }} />
                    <h3 style={{ color: '#fff' }}>No items found</h3>
                    <p style={{ color: '#94a3b8' }}>Try adjusting your search filters.</p>
                </div>
            )}
        </div>
    );
};

export default ItemListingNew;
