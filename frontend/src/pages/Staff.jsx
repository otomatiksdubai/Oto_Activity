import React, { useState, useEffect } from 'react';
import { staffAPI, authAPI } from '../services/api';
import PasswordModal from '../components/PasswordModal';
import ConfirmModal from '../components/ConfirmModal';
import StaffModal from '../components/StaffModal';

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'trainer',
    phone: '',
    specialization: ''
  });
  const [isLocked, setIsLocked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewMember, setViewMember] = useState(null);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedStaff = React.useMemo(() => {
    let items = [...staff];
    items.sort((a, b) => {
      let aVal = a[sortConfig.key] || '';
      let bVal = b[sortConfig.key] || '';
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [staff, sortConfig]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(userData.role || '');
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await staffAPI.getAll();
      setStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = (member) => {
    setViewMember(member);
    setShowViewModal(true);
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await staffAPI.create(formData);
      setFormData({ name: '', email: '', role: 'trainer', phone: '', specialization: '' });
      fetchStaff();
      alert('Staff member added successfully!');
    } catch (error) {
      alert('Failed to add staff member');
    }
  };

  const handleDeleteClick = (id) => {
    if (isLocked) {
      alert('Deletion is locked. Click the unlock button first.');
      return;
    }
    setDeletingId(id);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await staffAPI.delete(deletingId);
      setDeletingId(null);
      fetchStaff();
    } catch (error) {
      alert('Failed to delete staff member. Deletion is restricted if they have associated records.');
    }
  };

  const handleToggleLock = () => {
    if (!isLocked) {
      setIsLocked(true);
      return;
    }
    setShowUnlockModal(true);
  };

  const handleConfirmUnlock = async (password) => {
    try {
      const response = await authAPI.verifyPassword(password);
      if (response.data.success) {
        setIsLocked(false);
        return true;
      }
    } catch (error) {
      console.error('Verify password error:', error);
      throw error;
    }
  };

  return (
    <>
      <h1>Staff Management</h1>
      <p className="muted">Add and manage trainers and staff members (Admin only). Staff accounts are created automatically (Username: Name, Password: Phone).</p>

      {userRole === 'admin' && (
        <div id="staffForm" className="no-print">
          <h2>Add New Staff Member</h2>
          <form onSubmit={handleAddStaff}>
            <div className="row3">
              <div className="field">
                <label>Full Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="field">
                <label>Email (Optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
              <div className="field">
                <label>Phone (Default Password)</label>
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                  required
                />
              </div>
            </div>
            <div className="row3">
              <div className="field">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="trainer">Trainer</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="field">
                <label>Specialization (Optional)</label>
                <input
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g., Robotics, Arduino"
                />
              </div>
            </div>
            <div className="actions" style={{ marginTop: '10px' }}>
              <button type="submit" className="btn ok">Add Staff Member</button>
            </div>
          </form>
          <hr />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }} className="no-print">
        <h2 style={{ margin: 0 }}>Staff Members List</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {userRole === 'admin' && (
          <button
            className="btn ghost"
            onClick={handleToggleLock}
            style={{ fontWeight: 'bold' }}
          >
             {isLocked ? '🔒 Locked (Unlock Delete)' : '🔓 Unlocked (Lock Delete)'}
          </button>
        )}
        </div>
      </div>

      <div className="scroll-table-container no-print">
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('name')} style={{cursor: 'pointer'}}>Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th>Email</th>
              <th onClick={() => requestSort('role')} style={{cursor: 'pointer'}}>Role {sortConfig.key === 'role' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th>Phone</th>
              <th>Specialization</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : (
              sortedStaff.map((member) => (
                <tr key={member._id}>
                  <td>{member.name}</td>
                  <td>{member.email || '-'}</td>
                  <td>{member.role.toUpperCase()}</td>
                  <td>{member.phone || '-'}</td>
                  <td>{member.specialization || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        className="btn ghost"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        onClick={() => handleViewClick(member)}
                      >
                        View
                      </button>
                      {userRole === 'admin' && (
                        <button
                          className={`btn ${isLocked ? 'ghost' : 'danger'}`}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            opacity: isLocked ? 0.3 : 1,
                            cursor: isLocked ? 'not-allowed' : 'pointer'
                          }}
                          onClick={() => handleDeleteClick(member._id)}
                          disabled={isLocked}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PasswordModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        onConfirm={handleConfirmUnlock}
        title="Unlock Staff Deletion"
      />

      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setDeletingId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Staff Member?"
        message="Are you sure you want to remove this staff member? This will disable their login access."
      />

      <StaffModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        staffMember={viewMember}
        onSaveSuccess={fetchStaff}
      />
    </>
  );
}
