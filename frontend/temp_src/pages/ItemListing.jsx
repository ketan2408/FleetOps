import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Search, ShoppingCart } from 'lucide-react';

const ItemListing = () => {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/items?search=${search}&page=${page}&limit=6`);
            setItems(data.items);
            setTotalPages(data.pages);
        } catch (error) {
            console.error('Error fetching items', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, [page, search]);

    const handleOrder = async (itemId) => {
        try {
            await api.post('/orders', { item: itemId, quantity: 1 });
            alert('Order placed successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to place order');
        }
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Available Services & Vehicles</h1>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                    <input 
                        type="text" 
                        placeholder="Search items..." 
                        style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? <div>Loading...</div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {items.map(item => (
                        <div key={item._id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>{item.name}</h3>
                            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>{item.description}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>${item.price}</span>
                                <button 
                                    onClick={() => handleOrder(item._id)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    <ShoppingCart size={18} /> Order Now
                                </button>
                            </div>
                            <div style={{ marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                                Vendor: {item.vendor?.companyName}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}>Previous</button>
                <span>Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}>Next</button>
            </div>
        </div>
    );
};

export default ItemListing;
