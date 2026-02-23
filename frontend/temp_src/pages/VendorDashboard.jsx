import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Plus, Package, ClipboardList } from 'lucide-react';

const VendorDashboard = () => {
    const [items, setItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', description: '', price: '', available: true });

    useEffect(() => {
        fetchVendorData();
    }, []);

    const fetchVendorData = async () => {
        try {
            const [itemsRes, ordersRes] = await Promise.all([
                api.get('/items'), // Should be filtered by vendor in a real app, but here vendor logic is handled in controller
                api.get('/orders/vendor')
            ]);
            // For now, filter items by current vendor ID if possible, or assume backend filters
            setItems(itemsRes.data.items);
            setOrders(ordersRes.data);
        } catch (error) {
            console.error('Error fetching vendor data', error);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            await api.post('/items', newItem);
            setShowAddForm(false);
            setNewItem({ name: '', description: '', price: '', available: true });
            fetchVendorData();
        } catch (error) {
            alert('Failed to add item');
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status });
            fetchVendorData();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="container">
            <h1>Vendor Dashboard</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }}>
                {/* Left Column: Item Management */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2><Package size={24} /> My Items</h2>
                        <button onClick={() => setShowAddForm(!showAddForm)} style={{ padding: '0.5rem', borderRadius: '50%', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                            <Plus size={20} />
                        </button>
                    </div>

                    {showAddForm && (
                        <form onSubmit={handleAddItem} style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
                            <input placeholder="Item Name" required style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }} value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                            <textarea placeholder="Description" required style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }} value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                            <input type="number" placeholder="Price" required style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }} value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
                            <button type="submit" style={{ width: '100%', padding: '0.5rem', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '4px' }}>Add Item</button>
                        </form>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {items.map(item => (
                            <div key={item._id} style={{ background: '#fff', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                                <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                                <div style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>${item.price} - {item.available ? 'Available' : 'Unavailable'}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Order Management */}
                <div>
                    <h2><ClipboardList size={24} /> Recent Orders</h2>
                    <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#f8fafc' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Item</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Quantity</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Total</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order._id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '1rem' }}>{order.item?.name}</td>
                                        <td style={{ padding: '1rem' }}>{order.quantity}</td>
                                        <td style={{ padding: '1rem' }}>${order.totalAmount}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', backgroundColor: order.status === 'COMPLETED' ? '#dcfce7' : '#fef9c3' }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <select 
                                                value={order.status} 
                                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                style={{ padding: '0.25rem' }}
                                            >
                                                <option value="CREATED">Created</option>
                                                <option value="ACCEPTED">Accept</option>
                                                <option value="IN_PROGRESS">Process</option>
                                                <option value="COMPLETED">Complete</option>
                                                <option value="REJECTED">Reject</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
