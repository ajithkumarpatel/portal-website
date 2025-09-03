
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import StudentDashboard from './pages/student/StudentDashboard';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Spinner from './components/Spinner';

const AppRoutes: React.FC = () => {
    const { currentUser, loading, userData } = useAuth();
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-primary">
                <Spinner />
            </div>
        );
    }
    
    return (
        <Routes>
            <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
            <Route path="/signup" element={!currentUser ? <Signup /> : <Navigate to="/" />} />

            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/messages/:chatId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

            
            {/* Direct role routes for clarity, protected by role logic in Dashboard */}
            <Route path="/student" element={
                <ProtectedRoute>
                    {userData?.role === 'Student' ? <StudentDashboard /> : <Navigate to="/" />}
                </ProtectedRoute>
            } />
            <Route path="/faculty" element={
                <ProtectedRoute>
                    {userData?.role === 'Faculty' ? <FacultyDashboard /> : <Navigate to="/" />}
                </ProtectedRoute>
            } />
            <Route path="/admin" element={
                <ProtectedRoute>
                    {userData?.role === 'Admin' ? <AdminDashboard /> : <Navigate to="/" />}
                </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};


const App: React.FC = () => {
    return (
        <AuthProvider>
            <HashRouter>
                <div className="min-h-screen bg-cover bg-center bg-fixed" style={{backgroundImage: "url('https://picsum.photos/1920/1080?grayscale&blur=5')"}}>
                    <div className="min-h-screen bg-primary bg-opacity-80">
                         <AppRoutes />
                    </div>
                </div>
            </HashRouter>
        </AuthProvider>
    );
};

export default App;
