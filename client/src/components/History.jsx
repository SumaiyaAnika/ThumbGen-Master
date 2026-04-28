import React, { useState, useEffect } from 'react';
import { Trash2, AlertCircle, Loader, Image as ImageIcon, ArrowLeft } from 'lucide-react';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [clearing, setClearing] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/history', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to fetch history');
            }

            const data = await response.json();
            setHistory(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = async () => {
        if (!window.confirm("Are you sure you want to permanently delete your generation history?")) {
            return;
        }

        setClearing(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/history', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to clear history');
            }

            setHistory([]);
        } catch (err) {
            alert(`Error clearing history: ${err.message}`);
        } finally {
            setClearing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-gray-300 p-6 relative overflow-hidden flex flex-col">
            {/* Background glow - dialed down opacity to 5% and muted colors */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-900/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-slate-800/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Navbar Area */}
            <nav className="flex justify-between items-center mb-10 relative z-10 border-b border-gray-800/50 pb-4 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-4">
                    <a href="/dashboard" className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors" title="Back to Dashboard">
                        <ArrowLeft size={20} />
                    </a>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent flex items-center gap-2">
                        My History
                    </h1>
                </div>
                
                {history.length > 0 && !loading && (
                    <button 
                        onClick={handleClearHistory}
                        disabled={clearing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-900/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 rounded-xl font-medium transition-all border border-red-900/30 shadow-lg shadow-red-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {clearing ? <Loader size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        Clear History
                    </button>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full relative z-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500 gap-4">
                        <Loader size={48} className="animate-spin text-gray-600" />
                        <p className="text-lg">Loading your archives...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-red-400/80 gap-4 bg-red-950/10 rounded-2xl border border-red-900/20 p-8">
                        <AlertCircle size={48} />
                        <p className="text-lg font-medium">Something went wrong</p>
                        <p className="text-sm text-gray-500">{error}</p>
                        <button 
                            onClick={fetchHistory}
                            className="mt-4 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700"
                        >
                            Try Again
                        </button>
                    </div>
                ) : history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-gray-600 gap-6 bg-gray-900/30 rounded-3xl border border-gray-800/50 p-8">
                        <div className="w-24 h-24 rounded-full border border-gray-800 bg-gray-900/50 flex items-center justify-center shadow-inner">
                            <ImageIcon size={40} className="text-gray-700" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-medium text-gray-400 mb-2">No history found</h2>
                            <p className="text-sm text-gray-600 max-w-md mx-auto">
                                You haven't generated any thumbnails yet. Head back to the dashboard to create your first masterpiece.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                        {history.map((item) => (
                            <div 
                                key={item._id} 
                                className="group flex flex-col bg-gray-900/40 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all shadow-lg hover:shadow-xl hover:bg-gray-900/60"
                            >
                                <div className="relative aspect-video overflow-hidden bg-gray-950 flex items-center justify-center">
                                    <img 
                                        src={item.imageUrl} 
                                        alt={item.prompt || "Generated Thumbnail"} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                        <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                                            {item.prompt || "No prompt available"}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4 flex justify-between items-center border-t border-gray-800/50">
                                    <span className="text-xs font-medium text-gray-500 bg-gray-800/80 px-2.5 py-1 rounded-md">
                                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                                            month: 'short', day: 'numeric', year: 'numeric'
                                        })}
                                    </span>
                                    <a 
                                        href={item.imageUrl}
                                        download={`thumbnail-${item._id}.jpg`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-gray-500 hover:text-gray-300 transition-colors p-1.5 hover:bg-gray-800 rounded-md"
                                        title="Download Image"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default History;
