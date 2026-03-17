import React, { useState, useEffect } from 'react';
import { attendanceAPI, sessionAPI, studentAPI } from '../services/api';

export default function Attendance() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [studentsInSession, setStudentsInSession] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    remarks: '',
    topicsCovered: [],
    date: new Date().toISOString().split('T')[0]
  });
  const [currentStudentDetails, setCurrentStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAttendance = React.useMemo(() => {
    let items = [...attendance];
    items.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'date') {
        aVal = new Date(a.date);
        bVal = new Date(b.date);
      }
      if (sortConfig.key === 'student') {
        aVal = a.student?.name || '';
        bVal = b.student?.name || '';
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [attendance, sortConfig]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(userData.role || '');
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchAttendance();
      // Find students associated with this session
      const session = sessions.find(s => s._id === selectedSession);
      if (session && session.student) {
        setStudentsInSession([session.student]);
      }
    }
  }, [selectedSession, sessions]);

  useEffect(() => {
    if (formData.studentId) {
      fetchStudentDetails(formData.studentId);
    } else {
      setCurrentStudentDetails(null);
    }
  }, [formData.studentId]);

  const fetchStudentDetails = async (id) => {
    try {
      const response = await studentAPI.getById(id);
      setCurrentStudentDetails(response.data);
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await sessionAPI.getAll();
      setSessions(response.data);
      if (response.data.length > 0) {
        setSelectedSession(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await attendanceAPI.getBySession(selectedSession);
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleMark = async (status) => {
    if (!formData.studentId) {
      alert('Please select a student');
      return;
    }
    if (!formData.date) {
      alert('Please select a date');
      return;
    }
    try {
      await attendanceAPI.mark({
        sessionId: selectedSession,
        studentId: formData.studentId,
        status,
        remarks: formData.remarks,
        topicsCovered: formData.topicsCovered,
        date: formData.date
      });
      setFormData({ ...formData, studentId: '', remarks: '', topicsCovered: [] });
      fetchAttendance();
      if (formData.studentId) fetchStudentDetails(formData.studentId);
      alert(`Marked as ${status}`);
    } catch (error) {
      alert('Failed to mark attendance');
    }
  };

  return (
    <>
      <h1>Attendance</h1>
      <p className="muted">Select a session, then mark Present/Absent by Student Name.</p>

      <div className="row">
        <div className="field">
          <label>Session</label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
          >
            {sessions.map(s => (
              <option key={s._id} value={s._id}>
                {s.student?.name} - {s.program} ({s.day} {s.time})
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Topic Covered Status</label>
          <div className="muted" style={{ fontSize: '12px' }}>
            {currentStudentDetails?.lessonPlan ? (
                `${currentStudentDetails.lessonPlan.filter(t => t.status === 'completed').length} / ${currentStudentDetails.lessonPlan.length} topics completed`
            ) : 'Select a student to see progress'}
          </div>
        </div>
      </div>

      {(userRole === 'admin' || userRole === 'trainer') && (
        <div id="markBox" style={{ marginTop: '10px' }}>
          <h2>Mark Attendance</h2>
          <div className="row">
            <div className="field">
              <label>Student Name</label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              >
                <option value="">Select Student</option>
                {studentsInSession.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Date for Attendance</label>
              <input
                type="date"
                value={formData.date}
                max={new Date().toISOString().split('T')[0]} // Optional: prevent future dates
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Remarks (optional)</label>
              <input
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Reason for status"
              />
            </div>
          </div>
          
          {currentStudentDetails?.lessonPlan && (
            <div style={{ marginTop: '10px' }}>
              <label><strong>Select Topics Covered Today:</strong></label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '5px', marginTop: '5px' }}>
                {currentStudentDetails.lessonPlan.map((tp, idx) => (
                  <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', cursor: tp.status === 'completed' ? 'default' : 'pointer', opacity: tp.status === 'completed' ? 0.6 : 1 }}>
                    <input 
                      type="checkbox" 
                      disabled={tp.status === 'completed'}
                      checked={tp.status === 'completed' || formData.topicsCovered.includes(tp.topic)}
                      onChange={(e) => {
                        const topics = e.target.checked 
                          ? [...formData.topicsCovered, tp.topic]
                          : formData.topicsCovered.filter(t => t !== tp.topic);
                        setFormData({ ...formData, topicsCovered: topics });
                      }}
                    />
                    {tp.topic} {tp.status === 'completed' && '✅'}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="actions" style={{ marginTop: '10px' }}>
            <button className="btn ok" onClick={() => handleMark('present')}>Mark Present</button>
          </div>
          <hr />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }} className="no-print">
        <h2 style={{ margin: 0 }}>Attendance Records</h2>
      </div>

      <table>
        <thead>
          <tr>
            <th onClick={() => requestSort('student')} style={{cursor: 'pointer'}}>Student Name {sortConfig.key === 'student' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
            <th>Status</th>
            <th>Topics Covered</th>
            <th>Remarks</th>
            <th onClick={() => requestSort('date')} style={{cursor: 'pointer'}}>Date & Time {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
          </tr>
        </thead>
        <tbody>
          {sortedAttendance.length === 0 ? (
            <tr><td colSpan="5" style={{ textAlign: 'center' }}>No attendance records for this session</td></tr>
          ) : (
            sortedAttendance.map((record) => (
              <tr key={record._id}>
                <td>{record.student?.name || 'Unknown'}</td>
                <td>
                  <span className={`badge ${record.status === 'present' ? 'green' : 'red'}`}>
                    {record.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  {record.topicsCovered && record.topicsCovered.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '12px' }}>
                      {record.topicsCovered.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  ) : '-'}
                </td>
                <td>{record.remarks || '-'}</td>
                <td>{new Date(record.date).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
