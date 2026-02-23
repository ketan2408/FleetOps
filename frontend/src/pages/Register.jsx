import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = ({ isModal }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'USER',
        companyName: '',
        vendorType: 'REPAIR',
        subCategory: 'GENERAL_SERVICE'
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await register(formData);
            navigate(`/${data.role.toLowerCase()}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    const containerStyle = isModal ? { background: '#fff' } : { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 0' };
    const cardStyle = isModal ? { width: '100%', maxHeight: '80vh', overflowY: 'auto', background: '#fff', color: '#1e293b' } : { background: '#fff', color: '#1e293b', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Join FleetOps</h2>
                {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                        <input 
                            name="name"
                            type="text" 
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', color: '#1e293b' }}
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                        <input 
                            name="email"
                            type="email" 
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', color: '#1e293b' }}
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                        <input 
                            name="password"
                            type="password" 
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', color: '#1e293b' }}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Account Type</label>
                        <select 
                            name="role"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', color: '#1e293b' }}
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="USER">User / Fleet Manager</option>
                            <option value="VENDOR">Service Vendor</option>
                        </select>
                    </div>

                    {formData.role === 'VENDOR' && (
                        <>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Vendor Type</label>
                                <select 
                                    name="vendorType"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', background: '#f0f7ff' }}
                                    value={formData.vendorType}
                                    onChange={(e) => {
                                        const type = e.target.value;
                                        setFormData({ 
                                            ...formData, 
                                            vendorType: type, 
                                            subCategory: type === 'REPAIR' ? 'GENERAL_SERVICE' : 'NEW_CARS' 
                                        });
                                    }}
                                >
                                    <option value="REPAIR">🔧 Repair Vendor (Vehicle Repairs & Services)</option>
                                    <option value="VEHICLE_SALES">🚗 Vehicle Sales (New & Second-Hand Cars)</option>
                                </select>
                            </div>

                            {formData.vendorType === 'VEHICLE_SALES' && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Vehicle Category</label>
                                    <select 
                                        name="subCategory"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', background: '#f5f3ff' }}
                                        value={formData.subCategory}
                                        onChange={handleChange}
                                    >
                                        <option value="NEW_CARS">✨ New Cars</option>
                                        <option value="USED_CARS">🚗 Second-Hand Cars</option>
                                    </select>
                                </div>
                            )}

                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem' }}>
                                    {formData.vendorType === 'REPAIR' 
                                        ? 'You will offer repair, maintenance, and service listings.' 
                                        : `You are registering as a ${formData.subCategory === 'NEW_CARS' ? 'New Car' : 'Second-Hand Car'} dealer.`}
                                </p>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Company Name</label>
                                <input 
                                    name="companyName"
                                    type="text" 
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', color: '#1e293b' }}
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <button type="submit" style={{ width: '100%', padding: '0.75rem', border: 'none', borderRadius: '4px', backgroundColor: 'var(--primary)', color: '#fff', fontSize: '1rem', cursor: 'pointer' }}>
                        Register
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
