
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import StudentDashboard from './student/StudentDashboard';
import FacultyDashboard from './faculty/FacultyDashboard';
import AdminDashboard from './admin/AdminDashboard';
import Spinner from '../components/Spinner';

const Dashboard: React.FC = () => {
    const { userData, loading } = useAuth();

    if (loading || !userData) {
        return <div className="flex items-center justify-center min-h-screen"><Spinner /></div>;
    }

    switch (userData.role) {
        case 'Student':
            return <StudentDashboard />;
        case 'Faculty':
            return <FacultyDashboard />;
        case 'Admin':
            return <AdminDashboard />;
        default:
            // This should not happen if user data is consistent
            return <div className="flex items-center justify-center min-h-screen">Error: Unknown user role.</div>;
    }
};

export default Dashboard;
