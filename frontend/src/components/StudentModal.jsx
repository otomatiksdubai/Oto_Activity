import React, { useState, useEffect } from 'react';
import { studentAPI, attendanceAPI } from '../services/api';

const StudentModal = ({ isOpen, onClose, student, onSaveSuccess }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        grade: '',
        schoolName: '',
        parentPhone: '',
        courseEnrolled: '',
        status: 'active',
        lessonPlan: []
    });
    const [newTopic, setNewTopic] = useState('');
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUserRole(userData.role || '');
    }, []);

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name || '',
                grade: student.grade || '',
                schoolName: student.schoolName || '',
                parentPhone: student.parentPhone || '',
                courseEnrolled: student.courseEnrolled || '',
                status: student.status || 'active',
                lessonPlan: student.lessonPlan || []
            });
            setIsEditing(false); // Reset to view mode initially when opening a new student
            setActiveTab('details');
            if (isOpen) {
                fetchAttendanceHistory(student._id);
            }
        }
    }, [student, isOpen]);

    const fetchAttendanceHistory = async (studentId) => {
        try {
            const res = await attendanceAPI.getByStudent(studentId);
            setAttendanceHistory(res.data);
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        }
    };

    if (!isOpen || !student) return null;

    const handleSave = async (updatedData = formData) => {
        try {
            await studentAPI.update(student._id, updatedData);
            setIsEditing(false);
            if (onSaveSuccess) onSaveSuccess();
            alert('Student updated successfully!');
        } catch (error) {
            alert('Failed to update student');
            console.error(error);
        }
    };

    const handleAddTopic = () => {
        if (!newTopic.trim()) return;
        const updatedLessonPlan = [...formData.lessonPlan, { topic: newTopic.trim(), status: 'pending' }];
        const updatedData = { ...formData, lessonPlan: updatedLessonPlan };
        setFormData(updatedData);
        setNewTopic('');
        handleSave(updatedData);
    };

    const handleRemoveTopic = (index) => {
        const updatedLessonPlan = formData.lessonPlan.filter((_, i) => i !== index);
        const updatedData = { ...formData, lessonPlan: updatedLessonPlan };
        setFormData(updatedData);
        handleSave(updatedData);
    };

    return (
        <div className="modal">
            <div className="modal-content" style={{ maxWidth: '600px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>Student Details</h2>
                    <div>
                        {!isEditing && activeTab === 'details' && (
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
                        className={`btn ${activeTab === 'attendance' ? '' : 'ghost'}`} 
                        onClick={() => setActiveTab('attendance')}
                        style={{ padding: '6px 12px' }}
                    >
                        Attendance History
                    </button>
                    <button 
                        className={`btn ${activeTab === 'lessonPlan' ? '' : 'ghost'}`} 
                        onClick={() => setActiveTab('lessonPlan')}
                        style={{ padding: '6px 12px' }}
                    >
                        Lesson Plan
                    </button>
                </div>

                {activeTab === 'details' && (
                    <>
                        <div className="row">
                            <div className="field">
                                <label>Name</label>
                                {isEditing ? (
                                    <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                ) : (
                                    <p><strong>{student.name}</strong></p>
                                )}
                            </div>
                            <div className="field">
                                <label>Student ID</label>
                                <p className="muted">{student.studentId || '-'}</p>
                            </div>
                        </div>

                        <div className="row">
                            <div className="field">
                                <label>Grade</label>
                                {isEditing ? (
                                    <input value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })} />
                                ) : (
                                    <p>{student.grade || '-'}</p>
                                )}
                            </div>
                            <div className="field">
                                <label>School Name</label>
                                {isEditing ? (
                                    <input value={formData.schoolName} onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })} />
                                ) : (
                                    <p>{student.schoolName || '-'}</p>
                                )}
                            </div>
                        </div>

                        <div className="row">
                            <div className="field">
                                <label>Parent Phone</label>
                                {isEditing ? (
                                    <input value={formData.parentPhone} onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })} />
                                ) : (
                                    <p>{student.parentPhone || '-'}</p>
                                )}
                            </div>
                            <div className="field">
                                <label>Course Enrolled</label>
                                {isEditing ? (
                                    <input value={formData.courseEnrolled} onChange={(e) => setFormData({ ...formData, courseEnrolled: e.target.value })} />
                                ) : (
                                    <p>{student.courseEnrolled || '-'}</p>
                                )}
                            </div>
                        </div>

                        <div className="row">
                            <div className="field">
                                <label>Status</label>
                                {isEditing ? (
                                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="graduated">Graduated</option>
                                    </select>
                                ) : (
                                    <span className={`badge ${student.status === 'active' ? 'green' : 'red'}`}>{student.status?.toUpperCase() || 'ACTIVE'}</span>
                                )}
                            </div>
                            <div className="field">
                                <label>Created</label>
                                <p className="muted">{new Date(student.createdAt).toLocaleDateString()}</p>
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

                {activeTab === 'attendance' && (
                    <div className="scroll-table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Session</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Topics Covered</th>
                                    <th>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center' }} className="muted">No attendance data found</td>
                                    </tr>
                                ) : (
                                    attendanceHistory.map(record => (
                                        <tr key={record._id}>
                                            <td>{record.session ? `${record.session.program} (${record.session.day})` : 'Unknown'}</td>
                                            <td>{new Date(record.date).toLocaleDateString()}</td>
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
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'lessonPlan' && (
                    <div className="lesson-plan-container">
                        {userRole !== 'parent' && (
                            <div className="row" style={{ marginBottom: '15px' }}>
                                <div className="field" style={{ flex: 1 }}>
                                    <label>Add Topic to Lesson Plan</label>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <input 
                                            value={newTopic} 
                                            onChange={(e) => setNewTopic(e.target.value)} 
                                            placeholder="e.g. Introduction to Robotics"
                                        />
                                        <button className="btn ok" onClick={handleAddTopic}>Add</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="scroll-table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Topic</th>
                                        <th>Status</th>
                                        <th>Completed At</th>
                                        <th>Teacher Remarks</th>
                                        {userRole !== 'parent' && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.lessonPlan.length === 0 ? (
                                        <tr>
                                            <td colSpan={userRole !== 'parent' ? "5" : "4"} style={{ textAlign: 'center' }} className="muted">No topics added yet</td>
                                        </tr>
                                    ) : (
                                        formData.lessonPlan.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.topic}</td>
                                                <td>
                                                    <span className={`badge ${item.status === 'completed' ? 'green' : 'orange'}`}>
                                                        {item.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>{item.completedAt ? new Date(item.completedAt).toLocaleDateString() : '-'}</td>
                                                <td style={{ fontStyle: 'italic', fontSize: '11px' }}>{item.remarks || '-'}</td>
                                                {userRole !== 'parent' && (
                                                    <td>
                                                        <button 
                                                            className="btn danger ghost" 
                                                            style={{ padding: '2px 6px', fontSize: '11px' }}
                                                            onClick={() => handleRemoveTopic(index)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentModal;
