import React, { useState } from 'react';
import { Heart, MessageSquare, Play, MoreVertical, Edit2, Trash2, Send, X } from 'lucide-react';

const PostCard = ({ post, currentUserId, onLike, onComment, onEdit, onDelete, onRemix }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    const [editTitle, setEditTitle] = useState(post.originalTitle || '');
    const [editStrategy, setEditStrategy] = useState(post.geminiStrategy || '');

    const isCreator = currentUserId && post.creatorId && post.creatorId._id === currentUserId;
    const hasLiked = currentUserId && post.likes && post.likes.includes(currentUserId);

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (commentText.trim()) {
            onComment(post._id, commentText);
            setCommentText('');
        }
    };

    const handleEditSubmit = () => {
        onEdit(post._id, editTitle, editStrategy);
        setIsEditing(false);
        setShowMenu(false);
    };

    // Extract initials for Avatar
    const getInitials = (name) => {
        if (!name) return '?';
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 flex flex-col h-full">
            {/* Header: User Info & Menu */}
            <div className="p-3 flex justify-between items-center bg-gray-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-xs font-bold shadow-inner">
                        {getInitials(post.creatorId?.name)}
                    </div>
                    <span className="font-medium text-sm text-gray-200">{post.creatorId?.name || 'Unknown'}</span>
                </div>
                
                {isCreator && (
                    <div className="relative">
                        <button onClick={() => setShowMenu(!showMenu)} className="p-1 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white">
                            <MoreVertical size={18} />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-36 bg-gray-800 rounded-lg shadow-xl border border-gray-600 z-20 py-1">
                                <button onClick={() => setIsEditing(true)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2">
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button onClick={() => { setShowMenu(false); onDelete(post._id); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 text-red-400 flex items-center gap-2">
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Editing State Overlay or Main Image */}
            {isEditing ? (
                <div className="p-4 bg-gray-900 flex-1 flex flex-col gap-3 justify-center">
                    <h3 className="text-sm font-semibold text-gray-300">Edit Post Metadata</h3>
                    <input 
                        type="text" 
                        value={editTitle} 
                        onChange={e => setEditTitle(e.target.value)} 
                        placeholder="Title..."
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-pink-500"
                    />
                    <input 
                        type="text" 
                        value={editStrategy} 
                        onChange={e => setEditStrategy(e.target.value)} 
                        placeholder="Strategy..."
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-pink-500"
                    />
                    <div className="flex gap-2 justify-end mt-2">
                        <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded">Cancel</button>
                        <button onClick={handleEditSubmit} className="px-3 py-1.5 text-xs bg-pink-600 hover:bg-pink-500 rounded font-medium">Save</button>
                    </div>
                </div>
            ) : (
                <div className="relative group cursor-pointer aspect-video bg-black flex items-center justify-center overflow-hidden">
                    <img 
                        src={post.imageUrl} 
                        alt={post.originalTitle || "Thumbnail"} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
                        <h3 className="font-bold text-lg leading-tight line-clamp-1">{post.originalTitle || 'Untitled'}</h3>
                        <p className="text-xs text-pink-400 mt-1 font-medium bg-gray-900/50 inline-block px-2 py-0.5 rounded backdrop-blur-sm">{post.geminiStrategy || 'Custom'}</p>
                    </div>
                </div>
            )}

            {/* Interaction Bar */}
            <div className="px-4 flex items-center justify-between py-3 border-t border-gray-700/50 bg-gray-800 flex-none">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => onLike(post._id)}
                        className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-pink-400 group"
                    >
                        <Heart size={18} className={`transition-all ${hasLiked ? 'fill-pink-500 text-pink-500 scale-110' : 'text-gray-400 group-hover:text-pink-400'}`} />
                        <span className={hasLiked ? 'text-pink-500' : 'text-gray-400'}>{post.likes?.length || 0}</span>
                    </button>
                    <button 
                        onClick={() => setShowComments(!showComments)}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-blue-400 ${showComments ? 'text-blue-400' : 'text-gray-400'}`}
                    >
                        <MessageSquare size={18} />
                        <span>{post.comments?.length || 0}</span>
                    </button>
                </div>
                <button 
                    onClick={() => onRemix(post)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-xs transition-colors shadow-sm text-gray-200 hover:text-white"
                >
                    <Play size={12} className="fill-current" /> Remix
                </button>
            </div>

            {/* Expandable Comments Section */}
            {showComments && (
                <div className="bg-gray-900/50 border-t border-gray-700/50 p-4 flex-1 flex flex-col max-h-48">
                    <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-2 custom-scrollbar">
                        {post.comments && post.comments.length > 0 ? (
                            post.comments.map((c, i) => (
                                <div key={i} className="flex gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">
                                        {getInitials(c.userId?.name)}
                                    </div>
                                    <div className="bg-gray-800 rounded-lg rounded-tl-none p-2 text-sm text-gray-300 w-full">
                                        <span className="font-bold text-xs text-gray-400 block mb-0.5">{c.userId?.name || 'User'}</span>
                                        {c.text}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-gray-500 text-center italic mt-2">No comments yet. Be the first!</p>
                        )}
                    </div>
                    
                    {/* Add Comment Input */}
                    <form onSubmit={handleCommentSubmit} className="relative flex-none">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full bg-gray-800 border border-gray-700 rounded-full py-1.5 pl-4 pr-10 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <button 
                            type="submit" 
                            disabled={!commentText.trim()}
                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-blue-400 hover:text-blue-300 disabled:text-gray-600 disabled:hover:text-gray-600 transition-colors"
                        >
                            <Send size={14} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PostCard;
