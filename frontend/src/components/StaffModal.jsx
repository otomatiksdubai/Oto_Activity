import React, { useState, useEffect } from 'react';
import { staffAPI, sessionAPI } from '../services/api';

const StaffModal = ({ isOpen, onClose, staffMember, onSaveSuccess }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [staffSessions, setStaffSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        phone: '',
        specialization: ''
    });
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUserRole(userData.role || '');
    }, []);

    useEffect(() => {
        if (staffMember) {
            setFormData({
                name: staffMember.name || '',
                email: staffMember.email || '',
                role: staffMember.role || 'trainer',
                phone: staffMember.phone || '',
                specialization: staffMember.specialization || ''
            });
            setIsEditing(false);
            setActiveTab('details');
            if (isOpen) {
                fetchStaffSessions(staffMember._id);
            }
        }
    }, [staffMember, isOpen]);

    const fetchStaffSessions = async (staffId) => {
        setLoadingSessions(true);
        try {
            // Since there's no specific per-trainer endpoint, we get all and filter
            const res = await sessionAPI.getAll();
            const filtered = res.data.filter(s => s.trainer?._id === staffId);
            setStaffSessions(filtered);
        } catch (error) {
            console.error('Failed to fetch staff sessions:', error);
        } finally {
            setLoadingSessions(false);
        }
    };

    if (!isOpen || !staffMember) return null;

    const handleSave = async () => {
        try {
            await staffAPI.update(staffMember._id, formData);
            setIsEditing(false);
            if (onSaveSuccess) onSaveSuccess();
            alert('Staff member updated successfully!');
        } catch (error) {
            alert('Failed to update staff member');
            console.error(error);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content" style={{ maxWidth: '650px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>Staff Member Details</h2>
                    <div>
                        {!isEditing && activeTab === 'details' && userRole === 'admin' && (
                            <button className="btn" style={{ marginRight: '10px' }} onClick={() => setIsEditing(true)}>
                                Edit
                            </button>
                        )}
                        <button className="btn ghost" onClick={onClose} style={{ padding: '4px 8px', fontSize: '20px' }}>
                            &times;
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <button 
                        className={`btn ${activeTab === 'details' ? '' : 'ghost'}`} 
                        onClick={() => setActiveTab('details')}
                        style={{ padding: '6px 12px' }}
                    >
                        Details
                    </button>
                    <button 
                        className={`btn ${activeTab === 'sessions' ? '' : 'ghost'}`} 
                        onClick={() => setActiveTab('sessions')}
                        style={{ padding: '6px 12px' }}
                    >
                        Assigned Sessions
                    </button>
                </div>

                {activeTab === 'details' && (
                    <>
                        <div className="row">
                            <div className="field">
                                <label>Full Name</label>
                                {isEditing ? (
                                    <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                ) : (
                                    <p><strong>{staffMember.name}</strong></p>
                                )}
                            </div>
                            <div className="field">
                                <label>Role</label>
                                {isEditing ? (
                                    <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                        <option value="trainer">Trainer</option>
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                ) : (
                                    <p><span className="badge" style={{ background: 'var(--accent)', color: '#fff' }}>{staffMember.role?.toUpperCase()}</span></p>
                                )}
                            </div>
                        </div>

                        <div className="row">
                            <div className="field">
                                <label>Email</label>
                                {isEditing ? (
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                ) : (
                                    <p>{staffMember.email || '-'}</p>
                                )}
                            </div>
                            <div className="field">
                                <label>Phone</label>
                                {isEditing ? (
                                    <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                ) : (
                                    <p>{staffMember.phone || '-'}</p>
                                )}
                            </div>
                        </div>

                        <div className="row">
                            <div className="field">
                                <label>Specialization</label>
                                {isEditing ? (
                                    <input value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} placeholder="e.g. Robotics, Coding" />
                                ) : (
                                    <p>{staffMember.specialization || '-'}</p>
                                )}
                            </div>
                        </div>

                        {isEditing && (
                            <div className="actions" style={{ marginTop: '20px', justifyContent: 'flex-end' }}>
                                <button className="btn ghost" style={{ marginRight: '10px' }} onClick={() => setIsEditing(false)}>Cancel</button>
                                <button className="btn ok" onClick={handleSave}>Save Changes</button>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'sessions' && (
                    <div className="scroll-table-container">
                        {loadingSessions ? (
                            <p style={{ textAlign: 'center', padding: '20px' }}>Loading sessions...</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Program</th>
                                        <th>Day/Time</th>
                                        <th>Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffSessions.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center' }} className="muted">No sessions assigned to this trainer</td>
                                        </tr>
                                    ) : (
                                        staffSessions.map(session => (
                                            <tr key={session._id}>
                                                <td>{session.student?.name || 'Unknown'}</td>
                                                <td>{session.program}</td>
                                                <td>{session.day}, {session.time}</td>
                                                <td>{session.duration}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffModal;
