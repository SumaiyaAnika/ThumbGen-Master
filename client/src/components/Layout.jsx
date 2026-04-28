import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Sparkles, ScanSearch, Users, Scissors } from 'lucide-react';
import Footer from './Footer';

const Layout = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col relative overflow-x-hidden">
            
            {/* Global Navbar */}
            <div className="p-6">
                <nav className="flex flex-col md:flex-row justify-between items-center mb-0 relative z-10 border-b border-gray-800 pb-4 max-w-7xl mx-auto w-full gap-4 md:gap-0">
                    <Link to="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Sparkles className="text-pink-500" /> ThumbGen Master
                    </Link>
                    
                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
                        <Link to="/history" className="px-3 md:px-4 py-2 bg-pink-900/30 hover:bg-pink-900/50 text-pink-300 rounded-lg text-xs md:text-sm font-medium transition-colors border border-pink-700/50 flex items-center gap-1.5 md:gap-2 shadow-lg shadow-pink-900/20">
                            <ImageIcon size={16} /> My History
                        </Link>
                        <Link to="/vision" className="px-3 md:px-4 py-2 bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-300 rounded-lg text-xs md:text-sm font-medium transition-colors border border-indigo-700/50 flex items-center gap-1.5 md:gap-2 shadow-lg shadow-indigo-900/20">
                            <ScanSearch size={16} /> Vibe Matcher
                        </Link>
                        <Link to="/hub" className="px-3 md:px-4 py-2 bg-orange-900/30 hover:bg-orange-900/50 text-orange-300 rounded-lg text-xs md:text-sm font-medium transition-colors border border-orange-700/50 flex items-center gap-1.5 md:gap-2 shadow-lg shadow-orange-900/20">
                            <Users size={16} /> Hook Hub
                        </Link>
                        <Link to="/auralytics" className="px-3 md:px-4 py-2 bg-teal-900/30 hover:bg-teal-900/50 text-teal-300 rounded-lg text-xs md:text-sm font-medium transition-colors border border-teal-700/50 flex items-center gap-1.5 md:gap-2 shadow-lg shadow-teal-900/20">
                            <ScanSearch size={16} /> Auralytics
                        </Link>
                        <Link to="/studio" className="px-3 md:px-4 py-2 bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-300 rounded-lg text-xs md:text-sm font-medium transition-colors border border-cyan-700/50 flex items-center gap-1.5 md:gap-2 shadow-lg shadow-cyan-900/20">
                            <Scissors size={16} /> Studio Lab
                        </Link>
                        <button 
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('user');
                                window.location.href = '/';
                            }}
                            className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs md:text-sm font-medium transition-colors border border-gray-700 ml-auto md:ml-0"
                        >
                            Logout
                        </button>
                    </div>
                </nav>
            </div>

            {/* Dynamic Page Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col">
                <Outlet />
            </main>

            {/* Global Footer */}
            <Footer />
        </div>
    );
};

export default Layout;
