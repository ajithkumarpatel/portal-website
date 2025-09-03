import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
    const navigate = useNavigate();
    const { userData } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const handleLogout = async () => {
        // Fix: Use v8 signOut method
        await auth.signOut();
        navigate('/login');
    };
    
    const SidebarContent = () => {
        const navLinkClasses = "flex items-center p-3 text-gray-300 hover:bg-accent rounded-lg transition-colors";
        const activeNavLinkClasses = "bg-highlight text-white";

        return (
            <div className="flex flex-col h-full p-4">
                <h1 className="text-2xl font-bold text-white mb-8 border-b border-gray-600 pb-4">Academic Portal</h1>
                <nav className="flex-grow space-y-4">
                    <Link to="/" className={`${navLinkClasses} ${location.pathname === '/' || location.pathname.startsWith('/student') || location.pathname.startsWith('/faculty') || location.pathname.startsWith('/admin')  ? activeNavLinkClasses : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/messages" className={`${navLinkClasses} ${location.pathname.startsWith('/messages') ? activeNavLinkClasses : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <span>Messages</span>
                    </Link>
                </nav>
                <div className="pt-4 border-t border-gray-600">
                     <p className="text-lg font-semibold text-white truncate">{userData?.name}</p>
                    <p className="text-sm text-highlight">{userData?.role}</p>
                    <button
                        onClick={handleLogout}
                        className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h5.5a.5.5 0 000-1H3V4h5.5a.5.5 0 000-1H3zm8.146 3.146a.5.5 0 01.708 0l3 3a.5.5 0 010 .708l-3 3a.5.5 0 01-.708-.708L13.293 10 11.146 7.854a.5.5 0 010-.708z" clipRule="evenodd" /><path fillRule="evenodd" d="M8.5 10a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5z" clipRule="evenodd" /></svg>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        )
    };

    return (
        <div className="flex min-h-screen">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 bg-secondary shadow-lg">
                <SidebarContent />
            </aside>
            
            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 z-30 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
                <div className="w-64 bg-secondary h-full shadow-lg">
                    <SidebarContent />
                </div>
                 <div className="fixed inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)}></div>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                     <button className="md:hidden text-white text-2xl" onClick={() => setIsSidebarOpen(true)}>
                        ☰
                    </button>
                    <h2 className="text-3xl md:text-4xl font-bold text-white flex-1 text-center md:text-left">{title}</h2>
                </div>
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
