import React, { useState, useEffect } from 'react';
import { studentAPI, sessionAPI, feesAPI, attendanceAPI, reportAPI } from '../services/api';
import MarkAttendanceModal from '../components/MarkAttendanceModal';

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({
    students: 0,
    sessions: 0,
    unpaidFees: 0,
    partialFees: 0,
    totalHours: 0,
    usedHours: 0,
    remainingHours: 0,
    dailySales: 0,
    monthlySales: 0,
    newAdmissions: 0
  });
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [students, setStudents] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scheduleSort, setScheduleSort] = useState({ key: 'time', direction: 'asc' });
  const [attendanceSort, setAttendanceSort] = useState({ key: 'date', direction: 'desc' });

  const requestScheduleSort = (key) => {
    let direction = 'asc';
    if (scheduleSort.key === key && scheduleSort.direction === 'asc') {
      direction = 'desc';
    }
    setScheduleSort({ key, direction });
  };

  const requestAttendanceSort = (key) => {
    let direction = 'asc';
    if (attendanceSort.key === key && attendanceSort.direction === 'asc') {
      direction = 'desc';
    }
    setAttendanceSort({ key, direction });
  };

  const sortedSessions = React.useMemo(() => {
    let items = [...todaySessions];
    items.sort((a, b) => {
      let aVal = a[scheduleSort.key];
      let bVal = b[scheduleSort.key];
      if (scheduleSort.key === 'student') {
        aVal = a.student?.name || '';
        bVal = b.student?.name || '';
      }
      if (aVal < bVal) return scheduleSort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return scheduleSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [todaySessions, scheduleSort]);

  const sortedAttendance = React.useMemo(() => {
    let items = [...attendanceHistory];
    items.sort((a, b) => {
      let aVal = a[attendanceSort.key];
      let bVal = b[attendanceSort.key];
      if (attendanceSort.key === 'date') {
        aVal = new Date(a.date);
        bVal = new Date(b.date);
      }
      if (attendanceSort.key === 'student') {
        aVal = a.student?.name || '';
        bVal = b.student?.name || '';
      }
      if (aVal < bVal) return attendanceSort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return attendanceSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [attendanceHistory, attendanceSort]);

  useEffect(() => {
  const fetchStats = async () => {
    try {
      const promises = [
        studentAPI.getAll(),
        sessionAPI.getAll(),
        user.role === 'parent' ? Promise.resolve({ data: [] }) : feesAPI.getAll(),
        attendanceAPI.getAll(),
        (user.role === 'admin' || user.role === 'staff') ? reportAPI.getSales('daily') : Promise.resolve({ data: {} }),
        (user.role === 'admin' || user.role === 'staff') ? reportAPI.getSales('monthly') : Promise.resolve({ data: {} })
      ];

      const results = await Promise.all(promises);
      const studentsRes = results[0];
      const sessionsRes = results[1];
      const feesRes = results[2];
      const attendanceRes = results[3];
      const dailyRes = results[4];
      const monthlyRes = results[5];

        const unpaid = feesRes.data ? feesRes.data.filter(f => f.status === 'unpaid' || f.status === 'pending').length : 0;
        const partial = feesRes.data ? feesRes.data.filter(f => f.status === 'partial').length : 0;

        // Filter sessions (Today only for Admin/Staff/Trainer, All for Parent)
        const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const filteredSessions = user.role === 'parent' ? sessionsRes.data : sessionsRes.data.filter(s => s.day === todayName);
        setTodaySessions(filteredSessions);
        setTodayAttendance(attendanceRes.data || []);

        let totalHours = 0;
        let remainingHours = 0;

        if (user.role === 'parent') {
          sessionsRes.data.forEach(s => {
            totalHours += (s.totalHours || 0);
            remainingHours += (s.remainingHours || (s.totalHours || 0));
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
          usedHours: totalHours - remainingHours,
          dailySales: dailyRes?.data?.totalSales || 0,
          monthlySales: monthlyRes?.data?.totalSales || 0,
          newAdmissions: dailyRes?.data?.newAdmissionCount || 0
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
          {(user.role === 'admin' || user.role === 'staff') && (
            <>
              <div className="box" style={{ borderColor: 'var(--ok)' }}>
                <div className="muted">Today's Sales</div>
                <div className="num">AED {stats.dailySales}</div>
              </div>
              <div className="box" style={{ borderColor: 'var(--accent)' }}>
                <div className="muted">Monthly Sales</div>
                <div className="num">AED {stats.monthlySales}</div>
              </div>
              <div className="box" style={{ borderColor: 'var(--accent-pink)' }}>
                <div className="muted">New Admissions</div>
                <div className="num">{stats.newAdmissions}</div>
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ margin: 0 }}>
            {user.role === 'parent' ? "My Children's Schedule" : `Today's Schedule (${new Date().toLocaleDateString('en-US', { weekday: 'long' })})`}
          </h2>
        </div>
        <div className="scroll-table-container">
          <table>
            <thead>
              <tr>
                <th onClick={() => requestScheduleSort('time')} style={{cursor: 'pointer'}}>Time {scheduleSort.key === 'time' ? (scheduleSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => requestScheduleSort('student')} style={{cursor: 'pointer'}}>Student {scheduleSort.key === 'student' ? (scheduleSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th>Program</th>
                {user.role !== 'parent' && <th>Room</th>}
                <th>Trainer</th>
                <th>Status</th>
                {user.role !== 'parent' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {todaySessions.length === 0 ? (
                <tr>
                  <td colSpan={user.role === 'parent' ? "5" : "7"} style={{ textAlign: 'center' }} className="muted">No sessions scheduled for today</td>
                </tr>
              ) : (
                sortedSessions.map(session => {
                  const past = isPast(session.time);
                  const status = getStatus(session._id, session.student?._id);
                  return (
                    <tr key={session._id} style={{ opacity: past ? 0.7 : 1, transition: 'opacity 0.3s' }}>
                      <td><strong style={{ color: past ? '#888' : 'inherit' }}>{session.time}</strong></td>
                      <td>{session.student?.name || 'N/A'}</td>
                      <td>{session.program}</td>
                      {user.role !== 'parent' && <td>{session.room}</td>}
                      <td>{session.trainer?.name || 'Assigned'}</td>
                      <td>
                        {status ? (
                          <span className={`badge ${status === 'present' ? 'green' : 'red'}`} style={{ fontSize: '10px' }}>
                            {status.toUpperCase()}
                          </span>
                        ) : (
                          <span className="muted" style={{ fontSize: '10px' }}>{past ? 'NO RECORD' : 'UPCOMING'}</span>
                        )}
                      </td>
                      {user.role !== 'parent' && (
                        <td>
                          {(user.role === 'admin' || user.role === 'trainer') ? (
                            <button 
                              className="btn ghost" 
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => handleMarkClick(session)}
                            >
                              {status ? 'Edit' : 'Mark'}
                            </button>
                          ) : (
                            <span className="muted" style={{fontSize: '11px'}}>{status ? 'Marked' : 'Not Marked'}</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <hr style={{ margin: '30px 0' }} />
      </div>

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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2 style={{ margin: 0 }}>Children's Attendance History</h2>
          </div>
          <div className="scroll-table-container">
            <table>
              <thead>
                <tr>
                  <th onClick={() => requestAttendanceSort('student')} style={{cursor: 'pointer'}}>Student {attendanceSort.key === 'student' ? (attendanceSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th>Program</th>
                  <th>Status</th>
                  <th>Topics Covered</th>
                  <th>Remarks</th>
                  <th onClick={() => requestAttendanceSort('date')} style={{cursor: 'pointer'}}>Date & Time {attendanceSort.key === 'date' ? (attendanceSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }} className="muted">No attendance data yet</td>
                  </tr>
                ) : (
                  sortedAttendance.map(record => (
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
