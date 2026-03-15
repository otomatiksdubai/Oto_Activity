import React, { useState } from 'react';

export default function LevelUpModal({ isOpen, onClose, student, onLevelUpSuccess }) {
  const [newLevel, setNewLevel] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLevelUpSuccess(student._id, { newLevel: parseInt(newLevel, 10), remarks });
      setNewLevel('');
      setRemarks('');
      onClose();
    } catch (error) {
      alert('Failed to update level');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3>Level Up: {student.name}</h3>
          <button className="btn ghost" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '20px 0' }}>
            <p className="muted">Current Level: {student.level || 1}</p>
            <div className="field">
              <label>Next Level</label>
              <input 
                type="number" 
                value={newLevel} 
                onChange={(e) => setNewLevel(e.target.value)} 
                placeholder="Enter new level (e.g. 2)" 
                required 
                min={(student.level || 1) + 1}
              />
            </div>
            <div className="field" style={{ marginTop: '15px' }}>
              <label>Remarks</label>
              <textarea 
                value={remarks} 
                onChange={(e) => setRemarks(e.target.value)} 
                placeholder="e.g. Completed Arduino Level 1 projects"
              />
            </div>
          </div>
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn ok" disabled={loading}>
              {loading ? 'Updating...' : 'Confirm Level Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
