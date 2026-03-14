import React, { useState, useEffect } from 'react';
import { studentAPI, sessionAPI, feesAPI, attendanceAPI } from '../services/api';
import MarkAttendanceModal from '../components/MarkAttendanceModal';

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({
    students: 0,
    sessions: 0,
    unpaidFees: 0,
    partialFees: 0,
    totalHours: 0,
    usedHours: 0,
    remainingHours: 0
  });
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [students, setStudents] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchStats = async () => {
    try {
      const promises = [
        studentAPI.getAll(),
        sessionAPI.getAll(),
        feesAPI.getAll(),
        attendanceAPI.getAll() // Fetch today's attendance regardless of role to check 'marked' status
      ];

      const results = await Promise.all(promises);
      const studentsRes = results[0];
      const sessionsRes = results[1];
      const feesRes = results[2];
      const attendanceRes = results[3];

        const unpaid = feesRes.data.filter(f => f.status === 'unpaid' || f.status === 'pending').length;
        const partial = feesRes.data.filter(f => f.status === 'partial').length;

        // Filter sessions for today
        const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const filteredToday = sessionsRes.data.filter(s => s.day === todayName);
        setTodaySessions(filteredToday);
        setTodayAttendance(attendanceRes.data || []);

        let totalHours = 0;
        let remainingHours = 0;

        if (user.role === 'parent') {
          sessionsRes.data.forEach(s => {
            totalHours += (s.totalHours || 0);
            remainingHours += (s.remainingHours || 0);
          });
          setAttendanceHistory(attendanceRes.data || []);
        }

        setStudents(studentsRes.data);

        setStats({
          students: studentsRes.data.length,
          sessions: sessionsRes.data.length,
          unpaidFees: unpaid,
          partialFees: partial,
          totalHours,
          remainingHours,
          usedHours: totalHours - remainingHours
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user.role, user.username]);

  const isPast = (timeStr) => {
    if (!timeStr) return false;
    try {
      const parts = timeStr.split(' ');
      if (parts.length < 2) return false;
      const [time, modifier] = parts;
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours, 10);
      if (hours === 12) hours = 0;
      if (modifier.toUpperCase() === 'PM') hours += 12;
      
      const sessionDate = new Date();
      sessionDate.setHours(hours, parseInt(minutes, 10), 0, 0);
      return new Date() > sessionDate;
    } catch (e) {
      return false;
    }
  };

  const getStatus = (sessionId, studentId) => {
    const today = new Date().toISOString().split('T')[0];
    const record = todayAttendance.find(a => 
      a.session?._id === sessionId && 
      a.student?._id === studentId && 
      new Date(a.date).toISOString().split('T')[0] === today
    );
    return record ? record.status : null;
  };

  const handleMarkClick = (session) => {
    setSelectedSession(session);
    setShowMarkModal(true);
  };

  return (
    <>
      <h1>Dashboard</h1>
      <p className="muted">KPIs based on your role.</p>

      {loading ? (
        <p>Loading stats...</p>
      ) : (
        <div className="kpi">
          <div className="box">
            <div className="muted">Students</div>
            <div className="num">{stats.students}</div>
          </div>
          <div className="box">
            <div className="muted">Sessions</div>
            <div className="num">{stats.sessions}</div>
          </div>
          <div className="box">
            <div className="muted">Unpaid Fees</div>
            <div className="num">{stats.unpaidFees}</div>
          </div>
          <div className="box">
            <div className="muted">Partial Fees</div>
            <div className="num">{stats.partialFees}</div>
          </div>
        </div>
      )}

      {user.role !== 'parent' && (
        <div style={{ marginTop: '20px' }}>
          <h2>Today's Schedule ({new Date().toLocaleDateString('en-US', { weekday: 'long' })})</h2>
          <div className="scroll-table-container">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Student</th>
                  <th>Program</th>
                  <th>Room</th>
                  <th>Trainer</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {todaySessions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center' }} className="muted">No sessions scheduled for today</td>
                  </tr>
                ) : (
                  todaySessions.map(session => {
                    const past = isPast(session.time);
                    const status = getStatus(session._id, session.student?._id);
                    return (
                      <tr key={session._id} style={{ opacity: past ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                        <td><strong style={{ color: past ? '#888' : 'inherit' }}>{session.time}</strong></td>
                        <td>{session.student?.name || 'N/A'}</td>
                        <td>{session.program}</td>
                        <td>{session.room}</td>
                        <td>{session.trainer?.name || 'Assigned'}</td>
                        <td>
                          {status ? (
                            <span className={`badge ${status === 'present' ? 'green' : 'red'}`} style={{ fontSize: '10px' }}>
                              {status.toUpperCase()}
                            </span>
                          ) : (
                            <span className="muted" style={{ fontSize: '10px' }}>PENDING</span>
                          )}
                        </td>
                        <td>
                          <button 
                            className="btn ghost" 
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => handleMarkClick(session)}
                          >
                            {status ? 'Edit' : 'Mark'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <hr style={{ margin: '30px 0' }} />
        </div>
      )}

      <MarkAttendanceModal 
        isOpen={showMarkModal}
        onClose={() => setShowMarkModal(false)}
        session={selectedSession}
        onMarkSuccess={() => fetchStats()}
      />


      {user.role === 'parent' && (
        <div style={{ marginTop: '20px' }}>
          <h2>Session Hours Summary</h2>
          <div className="kpi" style={{ marginBottom: '20px' }}>
            <div className="box">
              <div className="muted">Total Hours</div>
              <div className="num">{stats.totalHours}</div>
            </div>
            <div className="box">
              <div className="muted">Hours Used</div>
              <div className="num">{stats.usedHours}</div>
            </div>
            <div className="box">
              <div className="muted">Remaining Hours</div>
              <div className="num">{stats.remainingHours}</div>
            </div>
          </div>

          <h2>Children's Attendance History</h2>
          <div className="scroll-table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Program</th>
                  <th>Status</th>
                  <th>Topics Covered</th>
                  <th>Remarks</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }} className="muted">No attendance data yet</td>
                  </tr>
                ) : (
                  attendanceHistory.map(record => (
                    <tr key={record._id}>
                      <td>{record.student?.name || 'Unknown'}</td>
                      <td>{record.session?.program || '-'}</td>
                      <td>
                        <span className={`badge ${record.status === 'present' ? 'green' : 'red'}`}>
                          {record.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {record.topicsCovered && record.topicsCovered.length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '11px' }}>
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
          </div>

          <h2 style={{ marginTop: '30px' }}>Curriculum & Lesson Plans</h2>
          {students.map(student => (
            <div key={student._id} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px', background: '#fcfcfc' }}>
              <h3 style={{ marginTop: 0 }}>{student.name}'s Lesson Plan</h3>
              <div className="scroll-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Topic</th>
                      <th>Status</th>
                      <th>Completed Date</th>
                      <th>Teacher Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!student.lessonPlan || student.lessonPlan.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center' }} className="muted">No lesson plan topics found</td>
                      </tr>
                    ) : (
                      student.lessonPlan.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.topic}</td>
                          <td>
                            <span className={`badge ${item.status === 'completed' ? 'green' : 'orange'}`}>
                              {item.status.toUpperCase()}
                            </span>
                          </td>
                          <td>{item.completedAt ? new Date(item.completedAt).toLocaleDateString() : '-'}</td>
                          <td style={{ fontStyle: 'italic', fontSize: '12px' }}>{item.remarks || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
