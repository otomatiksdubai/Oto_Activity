import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title = "Confirm Action", message = "Are you sure you want to proceed?" }) => {
    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
                <h2 style={{ marginBottom: '10px' }}>{title}</h2>
                <p style={{ fontSize: '15px', marginBottom: '24px', lineHeight: '1.4' }}>
                    {message}
                </p>

                <div className="actions" style={{ marginTop: '10px', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        className="btn ghost"
                        onClick={onClose}
                        style={{ marginRight: '10px' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn danger"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
