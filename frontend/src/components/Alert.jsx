import React from 'react';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose }) => {
    const alertClasses = {
        success: 'alert-success',
        error: 'alert-error',
        warning: 'alert-warning',
        info: 'alert-info'
    };

    const Icon = {
        success: CheckCircle,
        error: XCircle,
        warning: AlertCircle,
        info: Info
    }[type] || Info;

    return (
        <div className={`alert ${alertClasses[type]}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Icon size={20} />
            <span>{message}</span>
            {onClose && (
                <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    ✕
                </button>
            )}
        </div>
    );
};

export default Alert;
