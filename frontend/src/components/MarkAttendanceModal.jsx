import React, { useState, useEffect } from 'react';
import { studentAPI, attendanceAPI } from '../services/api';

const MarkAttendanceModal = ({ isOpen, onClose, session, onMarkSuccess }) => {
    const [formData, setFormData] = useState({
        remarks: '',
        topicsCovered: [],
        date: new Date().toISOString().split('T')[0]
    });
    const [studentDetails, setStudentDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && session && session.student) {
            fetchStudentDetails(session.student._id || session.student);
            // Reset form
            setFormData({
                remarks: '',
                topicsCovered: [],
                date: new Date().toISOString().split('T')[0]
            });
        }
    }, [isOpen, session]);

    const fetchStudentDetails = async (studentId) => {
        try {
            const res = await studentAPI.getById(studentId);
            setStudentDetails(res.data);
        } catch (error) {
            console.error('Failed to fetch student details:', error);
        }
    };

    const handleMark = async (status) => {
        if (!session || !session.student) return;
        setLoading(true);
        try {
            await attendanceAPI.mark({
                sessionId: session._id,
                studentId: session.student._id || session.student,
                status,
                remarks: formData.remarks,
                topicsCovered: formData.topicsCovered,
                date: formData.date
            });
            alert(`Marked successfully as ${status}`);
            if (onMarkSuccess) onMarkSuccess();
            onClose();
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to mark attendance';
            alert(msg);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !session) return null;

    return (
        <div className="modal">
            <div className="modal-content" style={{ maxWidth: '500px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2 style={{ margin: 0 }}>Mark Attendance</h2>
                    <button className="btn ghost" onClick={onClose} style={{ fontSize: '20px' }}>&times;</button>
                </div>

                <div className="muted" style={{ marginBottom: '15px' }}>
                    <strong>{session.student?.name}</strong> - {session.program}<br/>
                    {session.time} | Room: {session.room}
                </div>

                <div className="field" style={{ marginBottom: '15px' }}>
                    <label>Remarks (optional)</label>
                    <input 
                        value={formData.remarks} 
                        onChange={(e) => setFormData({...formData, remarks: e.target.value})} 
                        placeholder="e.g. Completed basics"
                    />
                </div>

                {studentDetails?.lessonPlan && (
                    <div style={{ marginBottom: '15px' }}>
                        <label><strong>Topics Covered Today:</strong></label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '5px', marginTop: '5px', maxHeight: '150px', overflowY: 'auto', padding: '5px', border: '1px solid #eee' }}>
                            {studentDetails.lessonPlan.map((tp, idx) => (
                                <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', opacity: tp.status === 'completed' ? 0.6 : 1 }}>
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

                <div className="actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button className="btn" onClick={onClose} disabled={loading}>Cancel</button>
                    <button className="btn ok" onClick={() => handleMark('present')} disabled={loading}>Mark Present</button>
                </div>
            </div>
        </div>
    );
};

export default MarkAttendanceModal;
