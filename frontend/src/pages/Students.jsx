import React, { useState, useEffect } from 'react';
import { studentAPI, authAPI } from '../services/api';
import PasswordModal from '../components/PasswordModal';
import ConfirmModal from '../components/ConfirmModal';
import StudentModal from '../components/StudentModal';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    schoolName: '',
    parentPhone: '',
    courseEnrolled: ''
  });
  const [isLocked, setIsLocked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(userData.role || '');
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getAll();
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await studentAPI.create(formData);
      setFormData({ name: '', grade: '', schoolName: '', parentPhone: '', courseEnrolled: '' });
      fetchStudents();
      alert('Student added successfully!');
    } catch (error) {
      alert('Failed to add student');
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

  const handleViewClick = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await studentAPI.delete(deletingId);
      setDeletingId(null);
      fetchStudents();
    } catch (error) {
      alert('Failed to delete student. Check if they have associated records.');
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
      <h1>Students</h1>
      <p className="muted">Admin/Staff can add students. Only Admin can delete. Parent accounts are created automatically (Username: Student Name, Password: Parent Phone Number).</p>

      {userRole !== 'parent' && (
        <div id="studentForm" className="no-print">
          <h2>Add Student</h2>
          <form onSubmit={handleAddStudent}>
            <div className="row">
              <div className="field">
                <label>Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Student name"
                  required
                />
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label>Grade</label>
                <input
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="G4"
                />
              </div>
              <div className="field">
                <label>School Name</label>
                <input
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  placeholder="School name"
                />
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label>Parent Phone Number</label>
                <input
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  placeholder="0501234567"
                />
              </div>
              <div className="field">
                <label>Course Enrolled</label>
                <input
                  value={formData.courseEnrolled}
                  onChange={(e) => setFormData({ ...formData, courseEnrolled: e.target.value })}
                  placeholder="e.g., Robotics Basics, Arduino Level 1"
                />
              </div>
            </div>
            <div className="actions" style={{ marginTop: '10px' }}>
              <button type="submit" className="btn ok">Add</button>
            </div>
          </form>
          <hr />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }} className="no-print">
        <h2 style={{ margin: 0 }}>Students List</h2>
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

      <div className="scroll-table-container no-print">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Grade</th>
              <th>School</th>
              <th>Course Enrolled</th>
              <th>Parent Phone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>No students found</td></tr>
            ) : (
              students.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.grade}</td>
                  <td>{student.schoolName}</td>
                  <td>{student.courseEnrolled}</td>
                  <td>{student.parentPhone}</td>
                  <td>
                    <button
                      className="btn ghost"
                      style={{ padding: '4px 8px', fontSize: '12px', marginRight: '8px' }}
                      onClick={() => handleViewClick(student)}
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
                        onClick={() => handleDeleteClick(student._id)}
                        disabled={isLocked}
                      >
                        Delete
                      </button>
                    )}
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
        title="Unlock Student Deletion"
      />

      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setDeletingId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Student?"
        message="This will permanently remove the student record. This action cannot be undone."
      />

      <StudentModal
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        student={selectedStudent}
        onSaveSuccess={fetchStudents}
      />
    </>
  );
}
