

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfile, Role, AttendanceRecord, ResultRecord } from '../../types';
import { SUBJECTS } from '../../constants';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import Input from '../../components/Input';
import Select from '../../components/Select';

const FacultyDashboard: React.FC = () => {
    const { userData } = useAuth();
    const [students, setStudents] = useState<UserProfile[]>([]);
    const [attendance, setAttendance] = useState<{[key: string]: 'Present' | 'Absent'}>({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    // State for adding results
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [subject, setSubject] = useState(SUBJECTS[0]);
    const [score, setScore] = useState('');

    const fetchStudentsAndAttendance = useCallback(async () => {
        if (!userData) return;
        setLoading(true);
        setError('');
        try {
            // Fetch students
            const studentsQuery = db.collection("users")
                .where("department", "==", userData.department)
                .where("role", "==", Role.Student);
            const studentsSnapshot = await studentsQuery.get();
            const studentsData = studentsSnapshot.docs.map(doc => doc.data() as UserProfile);
            setStudents(studentsData);

            if (studentsData.length > 0) {
                if(!selectedStudentId) setSelectedStudentId(studentsData[0].uid);

                // Fetch attendance for these students on the selected date
                const studentIds = studentsData.map(s => s.uid);
                const attendanceQuery = db.collection("attendance")
                    .where("userId", "in", studentIds)
                    .where("date", "==", selectedDate);
                const attendanceSnapshot = await attendanceQuery.get();
                const attendanceData = attendanceSnapshot.docs.map(doc => doc.data() as AttendanceRecord);
                
                const attendanceMap = studentsData.reduce((acc, student) => {
                    const record = attendanceData.find(att => att.userId === student.uid);
                    acc[student.uid] = record ? record.status : 'Absent';
                    return acc;
                }, {} as {[key: string]: 'Present' | 'Absent'});
                setAttendance(attendanceMap);
            }

        } catch (err) {
            console.error(err);
            setError('Failed to fetch dashboard data.');
        }
        setLoading(false);
    }, [userData, selectedDate, selectedStudentId]);

    useEffect(() => {
        fetchStudentsAndAttendance();
    }, [fetchStudentsAndAttendance]);

    const handleAttendanceChange = (studentId: string, status: 'Present' | 'Absent') => {
        setAttendance(prev => ({...prev, [studentId]: status}));
    };

    const handleSaveAttendance = async () => {
        setSaving(true);
        setError('');
        const batch = db.batch();

        for (const student of students) {
            const studentId = student.uid;
            const status = attendance[studentId];
            const attendanceId = `att_${studentId}_${selectedDate}`;
            const attendanceRef = db.collection('attendance').doc(attendanceId);

            batch.set(attendanceRef, {
                userId: studentId,
                userName: student.name,
                date: selectedDate,
                status: status,
            });
        }
        try {
            await batch.commit();
            alert('Attendance saved successfully!');
        } catch (err) {
            console.error(err);
            setError('Failed to save attendance.');
        }
        setSaving(false);
    };


    const getGrade = (score: number): string => {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    };

    const handleAddResult = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentId || !subject || !score) {
            setError('Please fill all fields.');
            return;
        }
        const numericScore = parseInt(score, 10);
        if(isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
            setError('Score must be a number between 0 and 100.');
            return;
        }

        setError('');
        try {
            await db.collection('results').add({
                userId: selectedStudentId,
                userName: students.find(s => s.uid === selectedStudentId)?.name,
                subject,
                score: numericScore,
                grade: getGrade(numericScore)
            });
            alert('Result added successfully!');
            setScore('');
        } catch (err) {
            console.error(err);
            setError('Failed to add result.');
        }
    };

    return (
        <DashboardLayout title="Faculty Dashboard">
            {error && <p className="text-red-400 mb-4">{error}</p>}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Mark Attendance */}
                <Card>
                    <h3 className="text-xl font-bold mb-4 text-white">Mark Student Attendance</h3>
                    <div className="mb-4">
                        <label htmlFor="date-filter" className="block text-sm font-medium text-gray-300 mb-1">Select Date</label>
                        <Input id="date-filter" type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                    </div>
                     <div className="overflow-auto max-h-96">
                        <table className="w-full text-left">
                            <thead className="border-b border-gray-600 sticky top-0 bg-gray-800/30 backdrop-blur-sm">
                                <tr><th className="p-2">Student Name</th><th className="p-2">Status</th></tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={2} className="text-center p-4"><Spinner/></td></tr>
                                ) : students.length > 0 ? (
                                    students.map(student => (
                                        <tr key={student.uid} className="border-b border-gray-700">
                                            <td className="p-2">{student.name}</td>
                                            <td className="p-2">
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleAttendanceChange(student.uid, 'Present')} className={`px-2 py-1 text-xs rounded ${attendance[student.uid] === 'Present' ? 'bg-green-500 text-white' : 'bg-secondary'}`}>Present</button>
                                                    <button onClick={() => handleAttendanceChange(student.uid, 'Absent')} className={`px-2 py-1 text-xs rounded ${attendance[student.uid] === 'Absent' ? 'bg-red-500 text-white' : 'bg-secondary'}`}>Absent</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={2} className="text-center p-4">No students found for this department.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Button onClick={handleSaveAttendance} disabled={saving || loading} className="mt-4">
                        {saving ? 'Saving...' : 'Save Attendance'}
                    </Button>
                </Card>

                {/* Add Results */}
                <Card>
                    <h3 className="text-xl font-bold mb-4 text-white">Add Student Result</h3>
                    <form onSubmit={handleAddResult} className="space-y-4">
                        <div>
                            <label htmlFor="student-select" className="block text-sm font-medium text-gray-300 mb-1">Select Student</label>
                            <Select id="student-select" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}>
                                {students.map(s => <option key={s.uid} value={s.uid}>{s.name}</option>)}
                            </Select>
                        </div>
                        <div>
                            <label htmlFor="subject-select" className="block text-sm font-medium text-gray-300 mb-1">Select Subject</label>
                             <Select id="subject-select" value={subject} onChange={e => setSubject(e.target.value)}>
                                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </Select>
                        </div>
                        <div>
                            <label htmlFor="score-input" className="block text-sm font-medium text-gray-300 mb-1">Score (0-100)</label>
                            <Input id="score-input" type="number" min="0" max="100" value={score} onChange={e => setScore(e.target.value)} required />
                        </div>
                        <Button type="submit">Add Result</Button>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default FacultyDashboard;