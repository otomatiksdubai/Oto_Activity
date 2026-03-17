import React, { useState, useEffect } from 'react';
import { sessionAPI, studentAPI, staffAPI, courseAPI } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import Select from 'react-select';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    program: '',
    room: '',
    day: 'Monday',
    time: '10:00 AM',
    trainerId: '',
    duration: '1 Hour',
    totalHours: ''
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'student', direction: 'asc' });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedSessions = React.useMemo(() => {
    let items = [...sessions];
    items.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'student') {
        aVal = a.student?.name || '';
        bVal = b.student?.name || '';
      }
      if (sortConfig.key === 'trainer') {
        aVal = a.trainer?.name || '';
        bVal = b.trainer?.name || '';
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [sessions, sortConfig]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(userData.role || '');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsRes, studentsRes, staffRes, coursesRes] = await Promise.all([
        sessionAPI.getAll(),
        studentAPI.getAll(),
        staffAPI.getAll(),
        courseAPI.getAll()
      ]);
      setSessions(sessionsRes.data);
      setStudents(studentsRes.data);
      setTrainers(staffRes.data.filter(s => s.role === 'trainer' || s.role === 'admin'));
      setCourses(coursesRes.data);
    } catch (error) {
      console.error('Error fetching sessions data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    try {
      await sessionAPI.create(formData);
      setFormData({
        studentId: '',
        program: '',
        room: '',
        day: 'Monday',
        time: '10:00 AM',
        trainerId: '',
        duration: '1 Hour',
        totalHours: ''
      });
      fetchData();
      alert('Session created successfully!');
    } catch (error) {
      alert('Failed to create session');
    }
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await sessionAPI.delete(deletingId);
      setDeletingId(null);
      fetchData();
    } catch (error) {
      alert('Failed to delete session');
    }
  };

  return (
    <>
      <h1>Sessions</h1>
      <p className="muted">Admin and Trainers can create and manage sessions. Staff can monitor all session listings.</p>

      {(userRole === 'admin' || userRole === 'trainer') && (
        <div id="sessionForm" className="no-print">
          <h2>Create Session</h2>
          <form onSubmit={handleAddSession}>
            <div className="row3">
              <div className="field" style={{ minWidth: '220px' }}>
                <label>Student Name</label>
                <Select
                  options={students.map(s => ({
                    value: s._id,
                    label: `${s.studentId || 'No ID'} - ${s.name}`
                  }))}
                  value={formData.studentId ? {
                    value: formData.studentId,
                    label: students.find(s => s._id === formData.studentId)?.studentId ?
                      `${students.find(s => s._id === formData.studentId).studentId} - ${students.find(s => s._id === formData.studentId).name}` :
                      students.find(s => s._id === formData.studentId)?.name || ''
                  } : null}
                  onChange={(selectedOption) => setFormData({ ...formData, studentId: selectedOption ? selectedOption.value : '' })}
                  placeholder="Search Student..."
                  isClearable
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '40px',
                      border: '1px solid #ccc',
                      boxShadow: 'none',
                      '&:hover': { border: '1px solid #0056b3' }
                    })
                  }}
                />
              </div>
              <div className="field">
                <label>Program (Course)</label>
                <select
                  value={formData.program}
                  onChange={async (e) => {
                    if (e.target.value === 'ADD_NEW') {
                      const newCourseName = prompt('Enter new course name:');
                      if (newCourseName) {
                        try {
                          await courseAPI.create({ name: newCourseName });
                          const res = await courseAPI.getAll();
                          setCourses(res.data);
                          setFormData({ ...formData, program: newCourseName });
                        } catch (err) {
                          alert('Failed to add course');
                        }
                      }
                    } else {
                      setFormData({ ...formData, program: e.target.value });
                    }
                  }}
                  required
                >
                  <option value="">Select Program</option>
                  {courses.map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                  {userRole === 'admin' && (
                    <option value="ADD_NEW" style={{ fontWeight: 'bold', color: 'var(--accent)' }}>+ Add New Course...</option>
                  )}
                </select>
              </div>
              <div className="field">
                <label>Room</label>
                <input
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  placeholder="Lab 1"
                />
              </div>
            </div>
            <div className="row3">
              <div className="field">
                <label>Allotment Day</label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Allotment Time</label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                >
                  {['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Trainer</label>
                <select
                  value={formData.trainerId}
                  onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                  required
                >
                  <option value="">Select Trainer</option>
                  {trainers.map(t => <option key={t._id} value={t._id}>{t.name || t.username}</option>)}
                </select>
              </div>
            </div>
            <div className="row3">
              <div className="field">
                <label>Duration</label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                >
                  <option value="1 Hour">1 Hour Session</option>
                  <option value="2 Hours">2 Hours Session</option>
                </select>
              </div>
              <div className="field">
                <label>Total Hours (Package)</label>
                <input
                  type="number"
                  value={formData.totalHours}
                  onChange={(e) => setFormData({ ...formData, totalHours: e.target.value })}
                  placeholder="e.g., 10"
                  min="1"
                />
              </div>
            </div>
            <div className="row">
              <p className="small" style={{ marginTop: '5px', color: '#888' }}>* Date is automatically set to creation date.</p>
            </div>
            <div className="actions" style={{ marginTop: '10px' }}>
              <button type="submit" className="btn ok">Add Session</button>
            </div>
          </form>
          <hr />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }} className="no-print">
        <h2 style={{ margin: 0 }}>Sessions List</h2>
      </div>

      <div className="scroll-table-container no-print">
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('student')} style={{cursor: 'pointer'}}>Student Name {sortConfig.key === 'student' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th onClick={() => requestSort('program')} style={{cursor: 'pointer'}}>Program {sortConfig.key === 'program' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th onClick={() => requestSort('day')} style={{cursor: 'pointer'}}>Day {sortConfig.key === 'day' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th>Time</th>
              <th>Duration</th>
              <th>Total Hours</th>
              <th>Remaining</th>
              <th>Room</th>
              <th onClick={() => requestSort('trainer')} style={{cursor: 'pointer'}}>Trainer {sortConfig.key === 'trainer' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="10" style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : (
              sortedSessions.map((session) => (
                <tr key={session._id}>
                  <td>{session.student?.name || 'Unknown'}</td>
                  <td>{session.program}</td>
                  <td>{session.day}</td>
                  <td>{session.time}</td>
                  <td>{session.duration}</td>
                  <td>{session.totalHours}</td>
                  <td>{session.remainingHours || session.totalHours}</td>
                  <td>{session.room}</td>
                  <td>{session.trainer?.name || session.trainer?.username || 'Unknown'}</td>
                  <td>
                    {(userRole === 'admin' || userRole === 'trainer') && (
                      <button
                        className="btn danger"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        onClick={() => handleDeleteClick(session._id)}
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

      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setDeletingId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Session?"
        message="Are you sure you want to permanently remove this session? This action cannot be undone."
      />
    </>
  );
}
