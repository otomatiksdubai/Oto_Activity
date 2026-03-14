import React, { useState } from 'react';

const PasswordModal = ({ isOpen, onClose, onConfirm, title = "Password Verification" }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password) return;

        setLoading(true);
        setError('');
        try {
            await onConfirm(password);
            setPassword('');
            onClose();
        } catch (err) {
            setError('Invalid password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
                <h2 style={{ marginBottom: '10px' }}>{title}</h2>
                <p className="muted" style={{ fontSize: '14px', marginBottom: '20px' }}>
                    Please enter your login password to unlock deletion functionality.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="field">
                        <label>Current Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            autoFocus
                            required
                        />
                    </div>

                    {error && <div className="error" style={{ marginTop: '10px', fontSize: '13px' }}>{error}</div>}

                    <div className="actions" style={{ marginTop: '24px' }}>
                        <button
                            type="button"
                            className="btn ghost"
                            onClick={() => {
                                setPassword('');
                                setError('');
                                onClose();
                            }}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn ok"
                            disabled={loading || !password}
                        >
                            {loading ? 'Verifying...' : 'Unlock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordModal;
