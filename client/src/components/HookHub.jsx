import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Sparkles, Loader2, Plus, X, Upload } from 'lucide-react';
import PostCard from './PostCard';

const HookHub = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();
    
    // Publish Modal State
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [publishImagePreview, setPublishImagePreview] = useState(null);
    const [publishBase64, setPublishBase64] = useState(null);
    const [publishTitle, setPublishTitle] = useState('');
    const [publishStrategy, setPublishStrategy] = useState('');
    const [publishPrompt, setPublishPrompt] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);
    
    const fileInputRef = useRef(null);

    const token = localStorage.getItem('token');
    let userId = null;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userId = payload.id;
        } catch (e) {
            console.error("Could not parse token");
        }
    }

    const fetchFeed = async (pageNumber) => {
        try {
            const response = await fetch(`https://thumb-gen-master.vercel.app/api/hub/feed?page=${pageNumber}&limit=12`, {
                headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
            });
            const data = await response.json();
            if (data.success) {
                if (pageNumber === 1) {
                    setPosts(data.posts);
                } else {
                    setPosts(prev => [...prev, ...data.posts]);
                }
                setHasMore(data.hasMore);
            }
        } catch (error) {
            console.error("Failed to fetch feed:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce or simply fetch on page change
        fetchFeed(page);
    }, [page]);

    const handleLike = async (postId) => {
        try {
            const response = await fetch(`https://thumb-gen-master.vercel.app/api/hub/like/${postId}`, {
                method: 'PUT',
                headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
            });
            const data = await response.json();
            if (data.success) {
                setPosts(posts.map(post => post._id === postId ? { ...post, likes: data.likes } : post));
            }
        } catch (error) {
            console.error("Failed to toggle like:", error);
        }
    };

    const handleComment = async (postId, text) => {
        try {
            const response = await fetch(`https://thumb-gen-master.vercel.app/api/hub/comment/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ text })
            });
            const data = await response.json();
            if (data.success) {
                setPosts(posts.map(post => post._id === postId ? { ...post, comments: data.comments } : post));
            }
        } catch (error) {
            console.error("Failed to post comment:", error);
        }
    };

    const handleEdit = async (postId, originalTitle, geminiStrategy) => {
        try {
            const response = await fetch(`https://thumb-gen-master.vercel.app/api/hub/edit/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ originalTitle, geminiStrategy })
            });
            const data = await response.json();
            if (data.success) {
                setPosts(posts.map(post => post._id === postId ? { ...post, originalTitle: data.post.originalTitle, geminiStrategy: data.post.geminiStrategy } : post));
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Failed to edit post:", error);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post forever?")) return;
        try {
            const response = await fetch(`https://thumb-gen-master.vercel.app/api/hub/delete/${postId}`, {
                method: 'DELETE',
                headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
            });
            const data = await response.json();
            if (data.success) {
                setPosts(posts.filter(post => post._id !== postId));
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Failed to delete post:", error);
        }
    };

    const handleRemix = (post) => {
        navigate('/dashboard', {
            state: {
                prefillPrompt: post.aiPrompt || post.originalTitle,
                prefillStyle: post.geminiStrategy
            }
        });
    };

    // Publish Modal Logic
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPublishImagePreview(reader.result);
                setPublishBase64(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePublishSubmit = async () => {
        if (!publishBase64) return alert("Please select an image");
        setIsPublishing(true);
        try {
            const response = await fetch('https://thumb-gen-master.vercel.app/api/hub/publish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    imageBase64: publishBase64,
                    originalTitle: publishTitle,
                    geminiStrategy: publishStrategy,
                    aiPrompt: publishPrompt
                })
            });
            const data = await response.json();
            if (data.success) {
                // Prepend to feed
                setPosts([data.post, ...posts]);
                setShowPublishModal(false);
                // Reset form
                setPublishImagePreview(null);
                setPublishBase64(null);
                setPublishTitle('');
                setPublishStrategy('');
                setPublishPrompt('');
            } else {
                alert("Failed to publish: " + data.message);
            }
        } catch (e) {
            console.error("Publish error", e);
            alert("Error connecting to server.");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 relative overflow-x-hidden flex flex-col">
            <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            
            <nav className="flex justify-between items-center mb-8 relative z-10 border-b border-gray-800 pb-4 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" aria-label="Back to dashboard" className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors border border-transparent hover:border-gray-700">
                        <ChevronLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-orange-500 bg-clip-text text-transparent flex items-center gap-2">
                        <Sparkles className="text-pink-400" /> Hook Hub
                    </h1>
                </div>
                
                <button 
                    onClick={() => setShowPublishModal(true)}
                    className="flex justify-center items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-pink-500/20"
                >
                    <Plus size={16} /> Publish Masterpiece
                </button>
            </nav>

            <div className="max-w-7xl mx-auto relative z-10 w-full flex-1">
                {loading && page === 1 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-pink-400 gap-3">
                        <Loader2 size={32} className="animate-spin" />
                        <span className="animate-pulse font-medium">Loading Community Feed...</span>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-gray-800/30 rounded-2xl border border-gray-700 h-64 text-center">
                        <Sparkles size={48} className="text-gray-600 mb-4" />
                        <h2 className="text-xl font-bold text-gray-300">Hub is Empty</h2>
                        <p className="text-gray-500 mt-2 max-w-sm">No creations have been published yet. Be the first to pioneer the Hook Hub!</p>
                        <button 
                            onClick={() => setShowPublishModal(true)}
                            className="mt-6 px-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors font-medium text-sm"
                        >
                            Publish Now
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Feed Grid */}
                        <div 
                            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}
                        >
                            {posts.map(post => (
                                <PostCard 
                                    key={post._id} 
                                    post={post}
                                    currentUserId={userId}
                                    onLike={handleLike}
                                    onComment={handleComment}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onRemix={handleRemix}
                                />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="mt-12 text-center pb-8">
                                <button 
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors border border-gray-700 shadow-md flex items-center gap-2 mx-auto"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                                    {loading ? 'Loading...' : 'Load More Experiences'}
                                </button>
                            </div>
                        )}
                        {!hasMore && posts.length > 0 && (
                            <div className="mt-12 text-center text-gray-600 font-medium text-sm pb-8">
                                You've reached the edge of the universe.
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Global Publish Modal */}
            {showPublishModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/30">
                            <h2 className="text-lg font-bold">Publish to Hook Hub</h2>
                            <button aria-label="Close publish modal" onClick={() => setShowPublishModal(false)} className="text-gray-400 hover:text-white p-1">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            <div className="space-y-5">
                                {/* Image Uploader */}
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full aspect-video border-2 border-dashed border-gray-700 hover:border-pink-500 bg-gray-900 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden group"
                                >
                                    {publishImagePreview ? (
                                        <img src={publishImagePreview} alt="Preview" className="w-full h-full object-contain bg-black" />
                                    ) : (
                                        <div className="text-center flex flex-col items-center text-gray-500">
                                            <Upload size={28} className="mb-2" />
                                            <p className="text-sm">Click to select image file</p>
                                        </div>
                                    )}
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                </div>

                                <div>
                                    <label htmlFor="publish-title" className="block text-sm font-medium text-gray-400 mb-1">Original Title</label>
                                    <input 
                                        id="publish-title"
                                        type="text" 
                                        value={publishTitle} onChange={e => setPublishTitle(e.target.value)} 
                                        placeholder="Epic Neon Cityscape"
                                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="publish-strategy" className="block text-sm font-medium text-gray-400 mb-1">Style Strategy</label>
                                        <input 
                                            id="publish-strategy"
                                            type="text" 
                                            value={publishStrategy} onChange={e => setPublishStrategy(e.target.value)} 
                                            placeholder="Cyberpunk"
                                            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="publish-prompt" className="block text-sm font-medium text-gray-400 mb-1">Underlying AI Prompt</label>
                                    <textarea 
                                        id="publish-prompt"
                                        value={publishPrompt} onChange={e => setPublishPrompt(e.target.value)} 
                                        placeholder="Hyper realistic 8k neon street..."
                                        rows="3"
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500 resize-none"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-800 bg-gray-900 flex justify-end gap-3">
                            <button onClick={() => setShowPublishModal(false)} className="px-5 py-2 text-sm font-medium text-gray-400 hover:text-white rounded-lg">Cancel</button>
                            <button 
                                onClick={handlePublishSubmit} 
                                disabled={isPublishing}
                                className="px-6 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-bold text-sm shadow-lg shadow-pink-600/30 flex items-center gap-2 disabled:opacity-50"
                            >
                                {isPublishing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                {isPublishing ? 'Publishing...' : 'Publish to Feed'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HookHub;
