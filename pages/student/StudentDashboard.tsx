

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { AttendanceRecord, ResultRecord } from '../../types';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';

const StudentDashboard: React.FC = () => {
    const { currentUser, userData } = useAuth();
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [results, setResults] = useState<ResultRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [error, setError] = useState('');

    const today = new Date().toISOString().split('T')[0];

    const fetchDashboardData = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            // Fetch Attendance
            const attendanceQuery = db.collection("attendance")
                .where("userId", "==", currentUser.uid)
                .orderBy("date", "desc");
            const attendanceSnapshot = await attendanceQuery.get();
            const attendanceData = attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
            setAttendance(attendanceData);

            // Check if today's attendance is marked
            const todayAttendance = attendanceData.find(att => att.date === today);
            setAttendanceMarked(!!todayAttendance);

            // Fetch Results
            const resultsQuery = db.collection("results").where("userId", "==", currentUser.uid);
            const resultsSnapshot = await resultsQuery.get();
            const resultsData = resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ResultRecord));
            setResults(resultsData);

        } catch (err) {
            console.error(err);
            setError('Failed to load dashboard data.');
        }
        setLoading(false);
    }, [currentUser, today]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleMarkAttendance = async () => {
        if (!currentUser) return;
        try {
            await db.collection('attendance').add({
                userId: currentUser.uid,
                userName: userData?.name,
                date: today,
                status: 'Present'
            });
            setAttendanceMarked(true);
            fetchDashboardData(); // Refresh data
        } catch (err) {
            console.error(err);
            setError('Failed to mark attendance.');
        }
    };

    return (
        <DashboardLayout title="Student Dashboard">
            {error && <p className="text-red-400 mb-4">{error}</p>}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Profile and Attendance */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <h3 className="text-xl font-bold mb-4 text-white">My Profile</h3>
                        {userData ? (
                            <div className="space-y-2 text-gray-300">
                                <p><span className="font-semibold text-gray-100">Name:</span> {userData.name}</p>
                                <p><span className="font-semibold text-gray-100">Email:</span> {userData.email}</p>
                                <p><span className="font-semibold text-gray-100">Department:</span> {userData.department}</p>
                                <p><span className="font-semibold text-gray-100">Year:</span> {userData.year}</p>
                            </div>
                        ) : <Spinner />}
                    </Card>
                    <Card>
                        <h3 className="text-xl font-bold mb-4 text-white">Today's Attendance</h3>
                        <p className="mb-4 text-gray-300">Date: {new Date(today).toLocaleDateString()}</p>
                         <p className={`text-lg font-bold mb-4 ${attendance.find(a => a.date === today)?.status === 'Present' ? 'text-green-400' : 'text-gray-400'}`}>
                            Status: {attendance.find(a => a.date === today)?.status || 'Not Marked'}
                        </p>
                    </Card>
                </div>

                {/* Results and Attendance History */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <h3 className="text-xl font-bold mb-4 text-white">My Results</h3>
                         <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-600">
                                    <tr>
                                        <th className="p-2">Subject</th>
                                        <th className="p-2">Score</th>
                                        <th className="p-2">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={3} className="text-center p-4"><Spinner/></td></tr>
                                    ) : results.length > 0 ? (
                                        results.map(res => (
                                            <tr key={res.id} className="border-b border-gray-700">
                                                <td className="p-2">{res.subject}</td>
                                                <td className="p-2">{res.score}</td>
                                                <td className="p-2 font-bold text-highlight">{res.grade}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={3} className="text-center p-4">No results found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                    <Card>
                        <h3 className="text-xl font-bold mb-4 text-white">Attendance History</h3>
                        <div className="overflow-auto max-h-96">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-600 sticky top-0 bg-gray-800/30 backdrop-blur-sm">
                                    <tr>
                                        <th className="p-2">Date</th>
                                        <th className="p-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                       <tr><td colSpan={2} className="text-center p-4"><Spinner/></td></tr>
                                    ) : attendance.length > 0 ? (
                                        attendance.map(att => (
                                            <tr key={att.id} className="border-b border-gray-700">
                                                <td className="p-2">{new Date(att.date).toLocaleDateString()}</td>
                                                <td className={`p-2 font-semibold ${att.status === 'Present' ? 'text-green-400' : 'text-red-400'}`}>{att.status}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={2} className="text-center p-4">No attendance history.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentDashboard;