import React, { useState, useEffect } from 'react';
import { studentAPI, authAPI, courseAPI } from '../services/api';
import PasswordModal from '../components/PasswordModal';
import ConfirmModal from '../components/ConfirmModal';
import StudentModal from '../components/StudentModal';
import LevelUpModal from '../components/LevelUpModal';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
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
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelingStudent, setLevelingStudent] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedStudents = React.useMemo(() => {
    let sortableItems = [...students];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (sortConfig.key === 'createdAt') {
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [students, sortConfig]);

  const filteredStudents = React.useMemo(() => {
    return sortedStudents.filter(s => 
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.grade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.schoolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.courseEnrolled?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentPhone?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedStudents, searchTerm]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(userData.role || '');
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getAll();
      setStudents(response.data);
      if (selectedStudent) {
        const updated = response.data.find(s => s._id === selectedStudent._id);
        if (updated) setSelectedStudent(updated);
      }
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

  const handleLevelUpClick = (student) => {
    setLevelingStudent(student);
    setShowLevelUpModal(true);
  };

  const handleLevelUpSuccess = async (id, data) => {
    await studentAPI.levelUp(id, data);
    fetchStudents();
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
      <p className="muted">Admin can add and delete students. Staff can monitor all records. Parent accounts are created automatically (Username: Student Name, Password: Parent Phone Number).</p>

      {(userRole === 'admin' || userRole === 'trainer') && (
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
                <select
                  value={formData.courseEnrolled}
                  onChange={async (e) => {
                    if (e.target.value === 'ADD_NEW') {
                      const newCourse = prompt('Enter new course name:');
                      if (newCourse) {
                        try {
                          await courseAPI.create({ name: newCourse });
                          await fetchCourses();
                          setFormData({ ...formData, courseEnrolled: newCourse });
                        } catch (err) {
                          alert('Failed to add course');
                        }
                      }
                    } else {
                      setFormData({ ...formData, courseEnrolled: e.target.value });
                    }
                  }}
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                  {userRole === 'admin' && (
                    <option value="ADD_NEW" style={{ fontWeight: 'bold', color: 'var(--accent)' }}>+ Add New Course...</option>
                  )}
                </select>
              </div>
            </div>
            <div className="actions" style={{ marginTop: '10px' }}>
              <button type="submit" className="btn ok">Add</button>
            </div>
          </form>
          <hr />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }} className="no-print">
        <h2 style={{ margin: 0 }}>Students List</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="search-box">
             <input 
               type="text" 
               placeholder="Search..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '8px 12px 8px 35px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.1)', background: 'var(--card-bg) url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>\') no-repeat 12px center', fontSize: '13px' }}
             />
          </div>
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
              <th onClick={() => requestSort('grade')} style={{cursor: 'pointer'}}>Grade {sortConfig.key === 'grade' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th onClick={() => requestSort('schoolName')} style={{cursor: 'pointer'}}>School {sortConfig.key === 'schoolName' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th onClick={() => requestSort('courseEnrolled')} style={{cursor: 'pointer'}}>Course Enrolled {sortConfig.key === 'courseEnrolled' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th onClick={() => requestSort('level')} style={{cursor: 'pointer'}}>Level {sortConfig.key === 'level' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th onClick={() => requestSort('createdAt')} style={{cursor: 'pointer'}}>Admission Date {sortConfig.key === 'createdAt' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th>Parent Phone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.grade}</td>
                  <td>{student.schoolName}</td>
                  <td>{student.courseEnrolled}</td>
                  <td>
                    <span className="badge" style={{ background: 'var(--accent)', color: '#fff' }}>Lvl {student.level || 1}</span>
                  </td>
                  <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                  <td>{student.parentPhone}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        className="btn ghost"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        onClick={() => handleViewClick(student)}
                      >
                        View
                      </button>
                      {(userRole === 'admin' || userRole === 'trainer') && (
                        <button
                          className="btn ok"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          onClick={() => handleLevelUpClick(student)}
                        >
                          Level Up
                        </button>
                      )}
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

      <LevelUpModal
        isOpen={showLevelUpModal}
        onClose={() => setShowLevelUpModal(false)}
        student={levelingStudent}
        courses={courses}
        fetchCourses={fetchCourses}
        onLevelUpSuccess={handleLevelUpSuccess}
      />
    </>
  );
}
