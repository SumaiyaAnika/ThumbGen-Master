import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload, Clock, ListVideo, Play, LayoutTemplate, AlertTriangle, Wand2, Loader2, Wrench } from 'lucide-react';

const ZoneCheck = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [image, setImage] = useState(null);
    const [showZones, setShowZones] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isFixing, setIsFixing] = useState(false);
    const [aiWarning, setAiWarning] = useState('');

    useEffect(() => {
        if (location.state?.image) {
            setImage(location.state.image);
        }
    }, [location.state]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setIsAnalyzing(true);
        setAiWarning('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/studio/zone-check/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ image })
            });
            const data = await res.json();
            if (data.success && data.overlapping) {
                setAiWarning(`⚠️ ${data.warning}`);
                setShowZones(true);
            } else if (data.success && !data.overlapping) {
                setAiWarning('✅ Looks perfectly safe! No collisions detected.');
            }
        } catch (err) {
            console.error("AI Analysis failed:", err);
            setAiWarning('❌ AI Analysis failed due to server error.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAutoFix = async () => {
        if (!image) return;
        setIsFixing(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/studio/zone-check/autofix', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ image })
            });
            const data = await res.json();
            if (data.success) {
                setImage(data.image);
                setAiWarning('✅ Automatically padded and centered!');
            }
        } catch (err) {
            console.error("Auto-Fix failed:", err);
            setAiWarning('❌ Auto-Fix failed due to server error.');
        } finally {
            setIsFixing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col pt-10">
            {/* Nav */}
            <nav className="flex items-center mb-8 max-w-5xl mx-auto w-full border-b border-gray-800 pb-4">
                <button 
                    onClick={() => navigate('/studio')} 
                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors mr-4"
                >
                    <ChevronLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
                    <LayoutTemplate className="text-purple-400" /> Zone Check
                </h1>
            </nav>

            <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col items-center">
                
                {/* Controls */}
                <div className="w-full flex items-center justify-between mb-6 bg-gray-800/40 p-4 rounded-xl border border-gray-700">
                    <button 
                        onClick={() => setShowZones(!showZones)}
                        className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 shadow-lg ${
                            showZones 
                            ? 'bg-pink-600 hover:bg-pink-500 text-white border border-pink-500 shadow-pink-500/20' 
                            : 'bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200'
                        }`}
                    >
                        {showZones ? <AlertTriangle size={18} /> : <Play size={18} fill="currentColor"/>}
                        {showZones ? 'Hide Safe Zones' : 'Toggle Safe Zones'}
                    </button>
                    
                    <div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept="image/*"
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg flex items-center gap-2 border border-gray-700 transition-colors"
                        >
                            <Upload size={16} /> Choose Image
                        </button>
                    </div>
                </div>

                {/* AI Actions */}
                {image && (
                    <div className="w-full flex flex-col md:flex-row items-center gap-4 mb-6">
                        <button 
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || isFixing}
                            className="px-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:opacity-90 text-white disabled:opacity-50"
                        >
                            {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                            {isAnalyzing ? 'Analyzing...' : 'Analyze with AI ✨'}
                        </button>
                        
                        {aiWarning && (
                            <div className="flex-1 px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-lg text-sm font-medium animate-fade-in flex items-center justify-between">
                                <span className={aiWarning.includes('⚠️') ? 'text-amber-400' : aiWarning.includes('❌') ? 'text-red-400' : 'text-emerald-400'}>
                                    {aiWarning}
                                </span>
                                
                                {aiWarning.includes('⚠️') && (
                                    <button 
                                        onClick={handleAutoFix}
                                        disabled={isFixing}
                                        className="ml-4 px-4 py-1.5 rounded-md font-bold text-xs bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500 flex items-center gap-2 transition-all hover:text-white"
                                    >
                                        {isFixing ? <Loader2 size={14} className="animate-spin" /> : <Wrench size={14} />}
                                        Auto-Fix Thumbnail 🛠
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Main Preview Area */}
                <div className="w-full relative aspect-video bg-black rounded-xl border-2 border-gray-800 overflow-hidden shadow-2xl flex items-center justify-center select-none">
                    {image ? (
                        <img 
                            src={image} 
                            alt="Preview" 
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="text-gray-500 flex flex-col items-center gap-2">
                            <Upload size={32} className="opacity-50" />
                            <p>Upload a thumbnail to test</p>
                        </div>
                    )}

                    {/* YouTube UI Overlays & Danger Zones */}
                    {showZones && image && (
                        <div className="absolute inset-0 max-w-full max-h-full object-contain pointer-events-none">
                            {/* In a real scenario, object-contain makes the image bounds different from the container bounds. 
                                For perfect aspect-video bounds assuming the uploaded image is 16:9, we fill the container. */}
                            
                            {/* Top Right: Watch Later & Queue */}
                            <div className="absolute top-2 right-2 flex flex-col gap-2">
                                {/* Danger Zone Indicator */}
                                <div className="absolute inset-[-4px] bg-red-500/30 border border-dashed border-red-500 rounded-lg flex items-start justify-end p-1 -z-10">
                                     <span className="text-[10px] text-red-200 font-bold bg-red-900/80 px-1 rounded whitespace-nowrap absolute -left-20">Danger Zone</span>
                                </div>
                                <div className="w-8 h-8 bg-black/80 rounded flex items-center justify-center backdrop-blur-sm">
                                    <Clock size={18} className="text-white" />
                                </div>
                                <div className="w-8 h-8 bg-black/80 rounded flex items-center justify-center backdrop-blur-sm">
                                    <ListVideo size={18} className="text-white" />
                                </div>
                            </div>

                            {/* Bottom Right: Timestamp */}
                            <div className="absolute bottom-4 right-2">
                                {/* Danger Zone Indicator */}
                                <div className="absolute inset-[-4px] bg-red-500/30 border border-dashed border-red-500 rounded flex items-center justify-center -z-10">
                                   <span className="text-[10px] text-red-200 font-bold absolute -top-4 whitespace-nowrap bg-red-900/80 px-1 rounded">Danger Zone</span>
                                </div>
                                <div className="bg-black/80 text-white text-xs font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                                    12:34
                                </div>
                            </div>

                            {/* Bottom: Progress Bar */}
                            <div className="absolute bottom-0 left-0 right-0 h-1">
                                <div className="absolute inset-y-[-2px] inset-x-0 bg-red-500/30 border-y border-dashed border-red-500 -z-10"></div>
                                <div className="bg-gray-600/50 w-full h-full"></div>
                                <div className="bg-red-600 w-2/5 h-full absolute left-0 top-0"></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ZoneCheck;
