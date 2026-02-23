import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, X, Eye, EyeOff } from 'lucide-react';

const Login = ({ isModal }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isResetMode, setIsResetMode] = useState(false);
    const { login, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            if (isResetMode) {
                await resetPassword(email, newPassword);
                setSuccess('Password updated successfully! Please login.');
                setIsResetMode(false);
                setNewPassword('');
            } else {
                const data = await login(email, password);
                navigate(`/${data.role.toLowerCase()}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed');
        }
    };

    const containerStyle = isModal ? { background: 'transparent' } : { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 0', minHeight: '100vh', background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)' };
    const cardStyle = { 
        width: '100%', 
        maxWidth: '450px', 
        background: '#fff', 
        borderRadius: '40px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)', 
        overflow: 'hidden',
        position: 'relative'
    };

    const brandColor = '#2563eb';

    const headerGradientStyle = {
        background: 'linear-gradient(to bottom, #f0f7ff, #ffffff)',
        padding: '3rem 2rem 1rem 2rem',
        textAlign: 'center',
        borderBottom: '1px solid #fff'
    };

    const inputGroupStyle = {
        marginBottom: '2rem',
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
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '2.5rem' }}>
                        {isResetMode ? 'Reset Password' : 'Login'}
                    </h2>
                    
                    {error && <div style={{ color: 'var(--error)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
                    {success && <div style={{ color: brandColor, marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>{success}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>User Id / Email</label>
                            <input 
                                type="email" 
                                style={inputStyle}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                onFocus={(e) => e.target.style.borderBottomColor = brandColor}
                                onBlur={(e) => e.target.style.borderBottomColor = '#eee'}
                            />
                        </div>
                        
                        {!isResetMode ? (
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        style={inputStyle}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        onFocus={(e) => e.target.style.borderBottomColor = brandColor}
                                        onBlur={(e) => e.target.style.borderBottomColor = '#eee'}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>New Password</label>
                                <input 
                                    type="password" 
                                    style={inputStyle}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    onFocus={(e) => e.target.style.borderBottomColor = brandColor}
                                    onBlur={(e) => e.target.style.borderBottomColor = '#eee'}
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
                            {!isResetMode ? (
                                <>
                                    <div style={{ color: '#64748b' }}>
                                        New user? <Link to="/register" style={{ color: brandColor, fontWeight: '600', textDecoration: 'none' }}>Sign up</Link>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsResetMode(true)}
                                        style={{ background: 'none', border: 'none', color: brandColor, cursor: 'pointer', fontWeight: '500' }}
                                    >
                                        Forgot password?
                                    </button>
                                </>
                            ) : (
                                <button 
                                    type="button" 
                                    onClick={() => setIsResetMode(false)}
                                    style={{ background: 'none', border: 'none', color: brandColor, cursor: 'pointer', fontWeight: '500' }}
                                >
                                    Back to Login
                                </button>
                            )}
                        </div>

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
                            boxShadow: '0 10px 20px rgba(37,99,235,0.2)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            {isResetMode ? 'Reset' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
