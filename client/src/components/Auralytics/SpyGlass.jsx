import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Sparkles, Target, Zap, LayoutTemplate, Palette } from 'lucide-react';

const SpyGlass = () => {
    const navigate = useNavigate();
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [status, setStatus] = useState('idle'); // idle, fetching, complete, error
    const [errorMsg, setErrorMsg] = useState(null);
    const [extractedData, setExtractedData] = useState(null);
    const [thumbnailStr, setThumbnailStr] = useState(null);
    const [promptText, setPromptText] = useState('');

    const handleAnalyze = async () => {
        if (!youtubeUrl) return;

        setStatus('fetching');
        setErrorMsg(null);
        setExtractedData(null);
        setThumbnailStr(null);
        setPromptText('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/spyglass/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ url: youtubeUrl })
            });

            const data = await response.json();
            if (!data.success) {
                setStatus('error');
                setErrorMsg(data.error || 'Failed to analyze target via SpyGlass');
                return;
            }

            setThumbnailStr(data.thumbnailBase64);
            setExtractedData(data.extractedData);
            setPromptText(data.extractedData.perfectPrompt || '');
            setStatus('complete');

        } catch (error) {
            setStatus('error');
            setErrorMsg('Network error fetching SpyGlass data');
        }
    };

    const handleExport = () => {
        // Navigate to VibeMatcher prefilled
        navigate('/vision', { 
            state: { 
                thumbnailBase64: thumbnailStr
            } 
        });
    };

    return (
        <div className="max-w-6xl mx-auto relative z-10 w-full animate-fadeIn">
            {/* Search Bar */}
            <div className="flex gap-4 mb-8 bg-gray-800/40 p-4 rounded-xl border border-gray-700 shadow-lg backdrop-blur-md">
                <input 
                    type="url"
                    placeholder="Paste Competitor YouTube URL for SpyGlass Vision..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    disabled={status === 'fetching'}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 outline-none focus:border-pink-500 transition-colors"
                />
                <button 
                    onClick={handleAnalyze}
                    disabled={!youtubeUrl || status === 'fetching'}
                    className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-pink-900/20"
                >
                    {status === 'fetching' ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <Search size={20} />
                    )}
                    Run SpyGlass
                </button>
            </div>

            {errorMsg && (
                <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-8">
                    {errorMsg}
                </div>
            )}

            {status !== 'idle' && status !== 'fetching' && extractedData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Left: Original Target */}
                    <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700 p-6 flex flex-col items-center">
                        <h2 className="text-sm uppercase tracking-widest text-gray-400 font-bold mb-4 self-start flex items-center gap-2">
                            <Target size={16} className="text-pink-400" /> Original Target
                        </h2>
                        
                        {thumbnailStr ? (
                            <div className="relative w-full rounded-xl overflow-hidden shadow-2xl mb-6 bg-black border border-gray-700 group h-full flex flex-col justify-center items-center">
                                <img 
                                    src={thumbnailStr} 
                                    alt="Competitor Thumbnail" 
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                        ) : (
                            <div className="text-gray-500 italic mb-6">No high-res thumbnail available.</div>
                        )}
                    </div>

                    {/* Right: Extracted Data */}
                    <div className="bg-gradient-to-br from-pink-900/20 to-purple-900/10 backdrop-blur-md rounded-2xl border border-pink-700/30 p-6 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                            <Sparkles size={64} className="text-pink-400" />
                        </div>

                        <h2 className="text-sm uppercase tracking-widest text-pink-400 font-bold mb-4 flex items-center gap-2 relative z-10">
                            <Sparkles size={16} /> Extracted Thumbnail DNA
                        </h2>
                        
                        <p className="text-sm text-gray-400 mb-6 relative z-10">
                            We've broken down the core visual elements of this competitor thumbnail to help you rebuild and remix it:
                        </p>

                        <div className="flex-1 flex flex-col gap-5 mb-8 relative z-10">
                            <div className="bg-gray-900/60 p-5 rounded-xl border border-gray-800 shadow-inner">
                                <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Palette size={16} className="text-pink-400" /> Color DNA</h3>
                                <div className="flex gap-3 flex-wrap">
                                    {extractedData.colors && extractedData.colors.map((c, i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-600 shadow-md" style={{ backgroundColor: c }} title={c}></div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-gray-900/60 p-5 rounded-xl border border-gray-800 shadow-inner">
                                <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2"><LayoutTemplate size={16} className="text-purple-400" /> Structure</h3>
                                <p className="text-sm text-gray-300 leading-relaxed">{extractedData.composition}</p>
                            </div>
                            
                            <div className="bg-gray-900/60 p-5 rounded-xl border border-gray-800 shadow-inner">
                                <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2"><Zap size={16} className="text-yellow-400" /> Lighting Schema</h3>
                                <p className="text-sm text-gray-300 leading-relaxed">{extractedData.lighting}</p>
                            </div>
                        </div>

                        <button 
                            onClick={handleExport}
                            className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 rounded-xl font-bold text-white flex justify-center items-center gap-2 shadow-lg shadow-pink-900/40 transition-all relative z-10"
                        >
                            <Target size={20} /> Export to Vibe Matcher
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
};

export default SpyGlass;
