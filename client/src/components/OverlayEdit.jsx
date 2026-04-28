import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as fabric from 'fabric';
import { ChevronLeft, Type, Download, Pointer, Loader2, Sparkles } from 'lucide-react';

const OverlayEdit = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const fabricCanvasRef = useRef(null);
    
    // UI State
    const [loadingEmojis, setLoadingEmojis] = useState(false);
    const [emojis, setEmojis] = useState([]);
    const [promptDesc, setPromptDesc] = useState(location.state?.prompt || '');

    const backgroundImageStr = location.state?.image;

    // Initialize Fabric Canvas
    useEffect(() => {
        if (!backgroundImageStr) {
            navigate('/studio');
            return;
        }

        // Initialize wrapper container width handling
        const container = document.getElementById('canvas-container');
        const containerWidth = container ? container.clientWidth : 800;
        
        const initCanvas = async () => {
            // Fabric v6 syntax
            const canvas = new fabric.Canvas(canvasRef.current, {
                width: containerWidth,
                height: Math.round(containerWidth * (9/16)), // Fixed 16:9 for thumbnails
                backgroundColor: '#111827'
            });
            fabricCanvasRef.current = canvas;

            try {
                const img = await fabric.FabricImage.fromURL(backgroundImageStr);
                
                // Scale Background Image to fit nicely
                const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                img.set({
                    originX: 'center',
                    originY: 'center',
                    left: canvas.width / 2,
                    top: canvas.height / 2,
                    scaleX: scale,
                    scaleY: scale,
                    selectable: false,
                    evented: false // background doesn't interfere
                });
                
                canvas.add(img);
                // Send backwards so it sits as background
                canvas.sendObjectToBack(img);
                canvas.renderAll();
            } catch (err) {
                console.error("Failed to load fabric image:", err);
            }
        };

        if (canvasRef.current) {
            initCanvas();
        }

        // Cleanup
        return () => {
            if (fabricCanvasRef.current) {
                fabricCanvasRef.current.dispose();
            }
        };
    }, [backgroundImageStr, navigate]);

    // Fetch Emojis from Backend (Gemini)
    const fetchEmojis = async () => {
        if (!promptDesc) return alert("Please enter a short description to get AI emoji suggestions.");
        
        setLoadingEmojis(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://thumb-gen-master.vercel.app/api/studio/overlay-edit/suggest-emojis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ prompt: promptDesc })
            });
            const data = await response.json();
            if (data.success) {
                setEmojis(data.emojis);
            } else {
                console.warn(data.message);
                setEmojis(["🔥", "😱", "👇"]);
            }
        } catch (error) {
            console.error("Fetch emoji error:", error);
            setEmojis(["🔥", "🚨", "✅"]);
        } finally {
            setLoadingEmojis(false);
        }
    };

    // Tools Handlers
    const handleAddText = () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const text = new fabric.IText('EPIC TEXT', {
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: 'center',
            originY: 'center',
            fontFamily: 'Impact, sans-serif',
            fontSize: 80,
            fill: '#FFFF00', // Yellow
            stroke: '#000000', // Black outline
            strokeWidth: 4,
            fontWeight: 'bold',
            shadow: new fabric.Shadow({
                color: 'rgba(0,0,0,0.8)',
                blur: 10,
                offsetX: 5,
                offsetY: 5
            })
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
    };

    const handleAddArrow = () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        // Custom polygon for a simple red arrow
        const arrow = new fabric.Polygon([
            { x: 0, y: 15 },
            { x: 40, y: 15 },
            { x: 40, y: 0 },
            { x: 70, y: 25 },
            { x: 40, y: 50 },
            { x: 40, y: 35 },
            { x: 0, y: 35 }
        ], {
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: 'center',
            originY: 'center',
            fill: '#ff0000',
            stroke: '#ffffff',
            strokeWidth: 2,
            shadow: new fabric.Shadow({
                color: 'rgba(0,0,0,0.5)',
                blur: 5,
                offsetX: 2,
                offsetY: 2
            })
        });

        canvas.add(arrow);
        canvas.setActiveObject(arrow);
        canvas.renderAll();
    };

    const handleAddEmoji = (emojiStr) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const text = new fabric.Text(emojiStr, {
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: 'center',
            originY: 'center',
            fontSize: 100,
            shadow: new fabric.Shadow({
                color: 'rgba(0,0,0,0.5)',
                blur: 10,
                offsetX: 0,
                offsetY: 5
            })
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
    };

    const handleDownload = () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;
        
        // Deactivate active objects, so bounding boxes don't show in export
        canvas.discardActiveObject();
        canvas.renderAll();

        const dataURL = canvas.toDataURL({
            format: 'jpeg',
            quality: 0.95
        });

        const a = document.createElement('a');
        a.href = dataURL;
        a.download = `studio-masterpiece-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col relative overflow-hidden">
            <nav className="flex justify-between items-center mb-6 relative z-10 max-w-[1200px] mx-auto w-full border-b border-gray-800 pb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/studio', { state: { generatedImage: backgroundImageStr, prompt: promptDesc } })} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
                        Studio Lab: Overlay Engine
                    </h1>
                </div>
                <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 hover:text-white text-gray-300 rounded-xl font-bold text-sm transition-colors border border-gray-700"
                >
                    <Download size={16} /> Export Final
                </button>
            </nav>

            <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10 flex-1 h-full">
                {/* Tools Sidebar */}
                <div className="lg:col-span-1 space-y-6 flex flex-col h-full overflow-y-auto">
                    {/* Basic Elements Menu */}
                    <div className="bg-gray-800/50 backdrop-blur-md p-5 rounded-2xl border border-gray-700">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Elements tools</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={handleAddText}
                                className="w-full flex items-center gap-3 p-3 bg-gray-900 hover:bg-gray-700 rounded-xl transition-colors border border-gray-700"
                            >
                                <div className="p-2 bg-yellow-500/20 text-yellow-500 rounded"><Type size={18} /></div>
                                <span className="font-medium text-sm">Viral Text Box</span>
                            </button>
                            <button 
                                onClick={handleAddArrow}
                                className="w-full flex items-center gap-3 p-3 bg-gray-900 hover:bg-gray-700 rounded-xl transition-colors border border-gray-700"
                            >
                                <div className="p-2 bg-red-500/20 text-red-500 rounded"><Pointer size={18} /></div>
                                <span className="font-medium text-sm">Red Arrow Shape</span>
                            </button>
                        </div>
                    </div>

                    {/* AI Emoji Suggestions Tool */}
                    <div className="bg-gray-800/50 backdrop-blur-md p-5 rounded-2xl border border-gray-700 flex-1 flex flex-col">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">AI Reacts</h3>
                        <p className="text-xs text-gray-500 mb-2">Describe the image briefly to get CTR-boosting emojis.</p>
                        <input 
                            type="text" 
                            value={promptDesc} 
                            onChange={(e) => setPromptDesc(e.target.value)} 
                            placeholder="e.g. Scared man seeing a ghost" 
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-pink-500 mb-3"
                        />
                        <button 
                            onClick={fetchEmojis} disabled={loadingEmojis || !promptDesc}
                            className="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition-colors mb-4"
                        >
                            {loadingEmojis ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Fetch Emojis
                        </button>

                        {emojis.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2 mt-auto">
                                {emojis.map((em, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleAddEmoji(em)}
                                        className="text-4xl bg-gray-900 hover:bg-gray-700 rounded-xl p-4 transition-all hover:scale-105 active:scale-95 border border-gray-700 shadow-md flex items-center justify-center cursor-pointer"
                                    >
                                        {em}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-6 border-2 border-dashed border-gray-700 rounded-xl bg-gray-900/50 mt-auto">
                                <Sparkles size={24} className="text-gray-600 mx-auto mb-2" />
                                <p className="text-xs text-gray-500">Hit "Fetch Emojis" to get CTR-boosting emoji recommendations.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Canvas Container */}
                <div id="canvas-container" className="lg:col-span-3 bg-gray-800/20 border-2 border-gray-700 rounded-2xl flex items-center justify-center overflow-hidden h-fit shadow-2xl relative">
                    <canvas ref={canvasRef} className="block mx-auto" />
                </div>
            </div>
        </div>
    );
};

export default OverlayEdit;
