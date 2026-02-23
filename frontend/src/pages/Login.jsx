import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = ({ isModal }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
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

    const containerStyle = isModal ? { background: '#fff' } : { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 0' };
    const cardStyle = isModal ? { width: '100%', maxHeight: '80vh', overflowY: 'auto' } : { background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    {isResetMode ? 'Reset Password' : 'Login to FleetOps'}
                </h2>
                
                {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                {success && <div style={{ color: 'var(--primary)', marginBottom: '1rem', textAlign: 'center' }}>{success}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                        <input 
                            type="email" 
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    {!isResetMode ? (
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                            <input 
                                type="password" 
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    ) : (
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>New Password</label>
                            <input 
                                type="password" 
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {!isResetMode && (
                        <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                            <button 
                                type="button" 
                                onClick={() => setIsResetMode(true)}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: 'var(--primary)', 
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    <button type="submit" style={{ width: '100%', padding: '0.75rem', border: 'none', borderRadius: '4px', backgroundColor: 'var(--primary)', color: '#fff', fontSize: '1rem', cursor: 'pointer' }}>
                        {isResetMode ? 'Reset' : 'Login'}
                    </button>
                    
                    {isResetMode && (
                        <button 
                            type="button" 
                            onClick={() => setIsResetMode(false)}
                            style={{ 
                                width: '100%', 
                                marginTop: '1rem',
                                padding: '0.75rem', 
                                border: '1px solid #ccc', 
                                borderRadius: '4px', 
                                backgroundColor: 'transparent', 
                                color: 'inherit', 
                                fontSize: '1rem', 
                                cursor: 'pointer' 
                            }}
                        >
                            Back to Login
                        </button>
                    )}
                </form>
                
                {!isResetMode && (
                    <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                        Don't have an account? <Link to="/register">Register</Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Login;
