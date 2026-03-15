import React, { useState, useEffect } from 'react';
import { courseAPI } from '../services/api';

export default function LevelUpModal({ isOpen, onClose, student, onLevelUpSuccess, courses = [], fetchCourses }) {
  const [newLevel, setNewLevel] = useState('');
  const [course, setCourse] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(userData.role || '');
  }, []);

  useEffect(() => {
    if (student) {
      setNewLevel((student.level || 1) + 1);
      setCourse(student.courseEnrolled || '');
      setRemarks('');
      setLoading(false);
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Automatically increment level by 1
      const incrementedLevel = (student.level || 1) + 1;
      
      await onLevelUpSuccess(student._id, { 
        newLevel: incrementedLevel, 
        course,
        remarks 
      });
      onClose();
    } catch (error) {
      alert('Failed to update level');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content card" style={{ maxWidth: '450px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Level Up: {student.name}</h2>
          <button className="btn ghost" onClick={onClose} style={{ padding: '4px 8px', fontSize: '20px' }}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <div className="row" style={{ marginBottom: '20px' }}>
               <div className="field">
                  <label>Current Status</label>
                  <p className="badge" style={{ background: 'var(--accent)', color: '#fff', fontSize: '11px' }}>Lvl {student.level || 1} • {student.courseEnrolled}</p>
               </div>
               <div className="field">
                  <label>Promotion to</label>
                  <p className="badge ok" style={{ fontSize: '11px' }}>Lvl {(student.level || 1) + 1}</p>
               </div>
            </div>

            <div className="field">
              <label>Next Course</label>
              <select
                value={course}
                onChange={async (e) => {
                  if (e.target.value === 'ADD_NEW') {
                    const newCourseName = prompt('Enter new course name:');
                    if (newCourseName) {
                      try {
                        await courseAPI.create({ name: newCourseName });
                        if (fetchCourses) await fetchCourses();
                        setCourse(newCourseName);
                      } catch (err) {
                        alert('Failed to add course');
                      }
                    }
                  } else {
                    setCourse(e.target.value);
                  }
                }}
                required
              >
                <option value="">Select the next course</option>
                {courses.map(c => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
                {userRole === 'admin' && (
                  <option value="ADD_NEW" style={{ fontWeight: 'bold', color: 'var(--accent)' }}>+ Add New Course...</option>
                )}
              </select>
            </div>

            <div className="field" style={{ marginTop: '15px' }}>
              <label>Remarks / Achievements</label>
              <textarea 
                value={remarks} 
                onChange={(e) => setRemarks(e.target.value)} 
                placeholder="e.g. Completed Robotics Level 1 projects"
              />
            </div>
          </div>
          <div className="actions" style={{ justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn ok" disabled={loading}>
              {loading ? 'Updating...' : 'Confirm Promotion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
