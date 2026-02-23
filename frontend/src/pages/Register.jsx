import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, X } from 'lucide-react';

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

    const brandColor = '#2563eb';
    const brandLink = '#1d4ed8';

    const containerStyle = isModal ? { background: 'transparent' } : { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 0', minHeight: '100vh', background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)' };
    const cardStyle = { 
        width: '100%', 
        maxWidth: '450px', 
        background: '#fff', 
        borderRadius: '40px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)', 
        overflowY: isModal ? 'auto' : 'visible',
        maxHeight: isModal ? '90vh' : 'none',
        position: 'relative'
    };

    const headerGradientStyle = {
        background: 'linear-gradient(to bottom, #f0f7ff, #ffffff)',
        padding: '3rem 2rem 1rem 2rem',
        textAlign: 'center',
        borderBottom: '1px solid #fff'
    };

    const inputGroupStyle = {
        marginBottom: '1.5rem',
        position: 'relative'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.9rem',
        color: '#94a3b8',
        marginBottom: '0.2rem'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem 0',
        border: 'none',
        borderBottom: '1.5px solid #eee',
        background: 'transparent',
        fontSize: '1.1rem',
        color: '#1e293b',
        outline: 'none',
        transition: 'border-color 0.3s'
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                {/* Brand Header */}
                <div style={headerGradientStyle}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.5rem', background: '#fff', borderRadius: '15px', boxShadow: '0 4px 12px rgba(37,99,235,0.1)' }}>
                            <Car size={40} fill={brandColor} color={brandColor} />
                        </div>
                    </div>
                    <h1 style={{ color: brandColor, margin: '0', fontSize: '2.3rem', fontWeight: '800', letterSpacing: '-0.5px' }}>FleetOps</h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.2rem', fontWeight: '500' }}>Fleet Management Solutions</p>
                </div>

                <div style={{ padding: '2rem 3rem 3rem 3rem' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '2.5rem' }}>Join Us</h2>
                    {error && <div style={{ color: 'var(--error)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Full Name</label>
                            <input 
                                name="name"
                                type="text" 
                                style={inputStyle}
                                value={formData.name}
                                onChange={handleChange}
                                required
                                onFocus={(e) => e.target.style.borderBottomColor = brandColor}
                                onBlur={(e) => e.target.style.borderBottomColor = '#eee'}
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Email</label>
                            <input 
                                name="email"
                                type="email" 
                                style={inputStyle}
                                value={formData.email}
                                onChange={handleChange}
                                required
                                onFocus={(e) => e.target.style.borderBottomColor = brandColor}
                                onBlur={(e) => e.target.style.borderBottomColor = '#eee'}
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Password</label>
                            <input 
                                name="password"
                                type="password" 
                                style={inputStyle}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                onFocus={(e) => e.target.style.borderBottomColor = brandColor}
                                onBlur={(e) => e.target.style.borderBottomColor = '#eee'}
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Account Type</label>
                            <select 
                                name="role"
                                style={{ ...inputStyle, padding: '0.75rem 0' }}
                                value={formData.role}
                                onChange={handleChange}
                                onFocus={(e) => e.target.style.borderBottomColor = brandColor}
                                onBlur={(e) => e.target.style.borderBottomColor = '#eee'}
                            >
                                <option value="USER">User / Fleet Manager</option>
                                <option value="VENDOR">Service Vendor</option>
                            </select>
                        </div>

                        {formData.role === 'VENDOR' && (
                            <>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Vendor Type</label>
                                    <select 
                                        name="vendorType"
                                        style={{ ...inputStyle, borderBottomColor: brandColor, background: '#f8faff' }}
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

                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Company Name</label>
                                    <input 
                                        name="companyName"
                                        type="text" 
                                        style={inputStyle}
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        required
                                        onFocus={(e) => e.target.style.borderBottomColor = brandColor}
                                        onBlur={(e) => e.target.style.borderBottomColor = '#eee'}
                                    />
                                </div>
                            </>
                        )}

                        <button type="submit" style={{ 
                            width: '100%', 
                            padding: '1.2rem', 
                            border: 'none', 
                            borderRadius: '20px', 
                            backgroundColor: brandColor, 
                            color: '#fff', 
                            fontSize: '1.2rem', 
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginTop: '1rem',
                            boxShadow: '0 10px 20px rgba(37,99,235,0.2)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            Register
                        </button>
                    </form>
                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                        Already have an account? <Link to="/login" style={{ color: brandLink, fontWeight: '600', textDecoration: 'none' }}>Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
