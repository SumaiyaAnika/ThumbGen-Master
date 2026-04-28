import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Sparkles, ChevronLeft, Target, Eye, Import, BarChart } from 'lucide-react';
import { getPalette } from 'colorthief';
import * as faceapi from '@vladmandic/face-api';
import SpyGlass from './SpyGlass';
import CreatorLens from './CreatorLens';

const AuralyticsManager = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('strategy');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [status, setStatus] = useState('idle'); // idle, fetching, analyzing, strategizing, complete, error
    const [errorMsg, setErrorMsg] = useState(null);

    const [youtubeData, setYoutubeData] = useState(null);
    const [visualData, setVisualData] = useState(null);
    const [strategy, setStrategy] = useState(null);

    const imgRef = useRef(null);

    // Load face-api models once
    useEffect(() => {
        const loadModels = async () => {
            try {
                await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
                console.log('FaceAPI Models loaded natively.');
            } catch (err) {
                console.error("Face-api models failed to load", err);
            }
        };
        loadModels();
    }, []);

    const handleAnalyze = async () => {
        if (!youtubeUrl) return;

        setStatus('fetching');
        setErrorMsg(null);
        setYoutubeData(null);
        setVisualData(null);
        setStrategy(null);

        try {
            const token = localStorage.getItem('token');
            const ytResponse = await fetch('https://thumb-gen-master.vercel.app/api/auralytics/fetch-youtube', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ url: youtubeUrl })
            });

            const ytData = await ytResponse.json();
            if (!ytData.success) {
                setStatus('error');
                setErrorMsg(ytData.error || 'Failed to fetch YouTube data');
                return;
            }

            setYoutubeData(ytData);
            setStatus('analyzing');

        } catch (error) {
            setStatus('error');
            setErrorMsg('Network error fetching YouTube data');
        }
    };

    // When youtubeData arrives and finishes rendering image, trigger visual analysis
    const handleImageLoad = async () => {
        if (!imgRef.current) return;
        
        try {
            // 1. Extract Colors
            // Get 5 dominant colors
            const palette = getPalette(imgRef.current, 5);  
            
            // 2. Face Detection
            const detections = await faceapi.detectAllFaces(imgRef.current, new faceapi.TinyFaceDetectorOptions());
            
            let hasFace = detections.length > 0;
            let facePosition = 'None';

            if (hasFace) {
                const face = detections[0].box;
                const imgWidth = imgRef.current.width;
                const centerBoundaryL = imgWidth * 0.33;
                const centerBoundaryR = imgWidth * 0.66;
                const faceCenter = face.x + (face.width / 2);

                if (faceCenter < centerBoundaryL) facePosition = 'Left';
                else if (faceCenter > centerBoundaryR) facePosition = 'Right';
                else facePosition = 'Center';
            }

            const visualMeta = { colors: palette, hasFace, facePosition };
            setVisualData(visualMeta);
            
            // 3. Send to Strategy builder
            setStatus('strategizing');
            
            const token = localStorage.getItem('token');
            const stratResponse = await fetch('https://thumb-gen-master.vercel.app/api/auralytics/generate-strategy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ snippet: youtubeData.snippet, visualData: visualMeta })
            });

            const stratData = await stratResponse.json();
            
            if (stratData.success) {
                setStrategy(stratData.strategy);
                setStatus('complete');
            } else {
                setStatus('error');
                setErrorMsg('Strategy generation failed');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
            setErrorMsg('Visual Intelligence processing failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>

            <nav className="flex items-center mb-8 relative z-10 max-w-6xl mx-auto w-full border-b border-gray-800 pb-4">
                <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors mr-4">
                    <ChevronLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
                    <Target className="text-teal-400" /> Auralytics Engine
                </h1>
                <div className="ml-auto flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <BarChart size={14} /> Competitor Reverse-Engineering
                </div>
            </nav>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* MODE TOGGLE */}
                <div className="flex bg-gray-800/60 p-1 rounded-xl w-fit mx-auto mb-8 border border-gray-700 backdrop-blur-md">
                    <button 
                        onClick={() => setMode('strategy')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'strategy' ? 'bg-teal-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Competitor Strategy
                    </button>
                    <button 
                        onClick={() => setMode('spyglass')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'spyglass' ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Sparkles size={14} className="inline mr-1 text-pink-300" /> SpyGlass Vision
                    </button>
                    <button 
                        onClick={() => setMode('creatorlens')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'creatorlens' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Target size={14} className="inline mr-1 text-purple-300" /> CreatorLens
                    </button>
                </div>

                {mode === 'spyglass' ? (
                    <SpyGlass />
                ) : mode === 'creatorlens' ? (
                    <CreatorLens />
                ) : (
                    <>
                        {/* Search Bar */}
                <div className="flex gap-4 mb-8 bg-gray-800/40 p-4 rounded-xl border border-gray-700 shadow-lg backdrop-blur-md">
                    <input 
                        type="url"
                        placeholder="Paste Competitor YouTube URL here..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        disabled={status !== 'idle' && status !== 'complete' && status !== 'error'}
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 outline-none focus:border-teal-500 transition-colors"
                    />
                    <button 
                        onClick={handleAnalyze}
                        disabled={!youtubeUrl || (status !== 'idle' && status !== 'complete' && status !== 'error')}
                        className="px-6 py-3 bg-gradient-to-r from-teal-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-teal-900/20"
                    >
                        {(status === 'fetching' || status === 'analyzing' || status === 'strategizing') ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Search size={20} />
                        )}
                        Analyze Target
                    </button>
                </div>

                {errorMsg && (
                    <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-8">
                        {errorMsg}
                    </div>
                )}

                {status !== 'idle' && status !== 'fetching' && youtubeData && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Left: Deep Visual Analysis */}
                        <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700 p-6 flex flex-col items-center">
                            <h2 className="text-sm uppercase tracking-widest text-gray-400 font-bold mb-4 self-start flex items-center gap-2">
                                <Eye size={16} className="text-teal-400" /> Visual Extraction
                            </h2>
                            
                            {youtubeData.thumbnailBase64 ? (
                                <div className="relative w-full rounded-xl overflow-hidden shadow-2xl mb-6 bg-black border border-gray-700 group">
                                    <img 
                                        ref={imgRef}
                                        src={youtubeData.thumbnailBase64} 
                                        alt="Competitor Thumbnail" 
                                        crossOrigin="anonymous" // needed for colorthief/faceapi depending on server proxy
                                        onLoad={status === 'analyzing' ? handleImageLoad : undefined}
                                        className="w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                    />
                                    {status === 'analyzing' && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                            <div className="flex flex-col items-center gap-3 text-teal-400 animate-pulse">
                                                <Target size={32} />
                                                <span className="text-sm font-bold tracking-wider">Scanning Pixels...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-gray-500 italic mb-6">No high-res thumbnail available.</div>
                            )}

                            {/* Data Outputs */}
                            <div className="w-full space-y-4">
                                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                                    <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Target Title</h3>
                                    <p className="text-sm text-gray-200 font-medium line-clamp-2">{youtubeData.snippet.title}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                                        <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Color Heatmap</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {visualData && Array.isArray(visualData.colors) ? (
                                                visualData.colors.map((color, i) => (
                                                    <div key={i} className="w-8 h-8 rounded-full shadow-inner border border-gray-700" style={{ backgroundColor: `rgb(${color.join(',')})` }} title={`RGB: ${color.join(',')}`}></div>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-600">No vibrant colors extracted.</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 flex flex-col justify-center items-center text-center">
                                        <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Subject Tracking</h3>
                                        {visualData ? (
                                            <p className="text-sm font-bold text-indigo-400">
                                                {visualData.hasFace ? `Face Detected (${visualData.facePosition})` : 'No Faces'}
                                            </p>
                                        ) : (
                                            <span className="text-xs text-gray-600">Scanning...</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Strategy Board */}
                        <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700 p-6 flex flex-col">
                            <h2 className="text-sm uppercase tracking-widest text-gray-400 font-bold mb-4 flex items-center gap-2">
                                <Sparkles size={16} className="text-indigo-400" /> Gemini Strategy
                            </h2>

                            {status === 'strategizing' ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-indigo-400 gap-4 min-h-[300px]">
                                    <Loader2 size={40} className="animate-spin" />
                                    <p className="text-sm font-medium animate-pulse">Drafting Counter-Strategy...</p>
                                </div>
                            ) : strategy ? (
                                <div className="flex-1 flex flex-col space-y-4">
                                    <div className="bg-gradient-to-br from-indigo-900/20 to-transparent p-1 rounded-xl">
                                        <h3 className="text-sm font-bold text-indigo-300 mb-3 px-2">5 Actionable Suggestions</h3>
                                        <ul className="space-y-3">
                                            {strategy.suggestions && strategy.suggestions.map((sug, i) => (
                                                <li key={i} className="bg-gray-900/60 p-4 rounded-xl border border-gray-700/50 text-sm text-gray-300 flex items-start gap-3 hover:border-indigo-500/50 transition-colors">
                                                    <span className="text-indigo-400 font-bold bg-indigo-900/50 w-6 h-6 flex items-center justify-center rounded-full text-xs">{i + 1}</span>
                                                    <span className="flex-1 leading-relaxed">{sug}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-auto pt-4">
                                        <div className="bg-teal-900/20 border border-teal-800/50 p-4 rounded-xl border-l-4 border-l-teal-500">
                                            <h3 className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-2">Conclusion</h3>
                                            <p className="text-sm text-gray-300">"{strategy.conclusion}"</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-4 min-h-[300px] border-2 border-dashed border-gray-700 rounded-xl">
                                    <Target size={40} className="opacity-50" />
                                    <p className="text-sm">Awaiting target analysis...</p>
                                </div>
                            )}
                        </div>

                    </div>
                )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AuralyticsManager;
