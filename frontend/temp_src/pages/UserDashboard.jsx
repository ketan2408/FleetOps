import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Package, Clock } from 'lucide-react';

const UserDashboard = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/orders/user');
                setOrders(data);
            } catch (error) {
                console.error('Error fetching orders', error);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>User Dashboard</h1>
                <p>Welcome back! Here are your recent service requests.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {orders.length === 0 ? <p>No orders found. Head to the item listing to place one!</p> : (
                    orders.map(order => (
                        <div key={order._id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', borderLeft: '6px solid var(--primary)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                                    <Package size={20} color="var(--primary)" />
                                    {order.item?.name}
                                </div>
                                <span style={{ 
                                    padding: '0.25rem 0.75rem', 
                                    borderRadius: '999px', 
                                    fontSize: '0.8rem', 
                                    fontWeight: '500',
                                    backgroundColor: order.status === 'COMPLETED' ? '#dcfce7' : '#fefce8',
                                    color: order.status === 'COMPLETED' ? '#166534' : '#854d0e'
                                }}>
                                    {order.status}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Vendor: {order.vendor?.companyName}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Total: ${order.totalAmount}</div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock size={14} /> {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
