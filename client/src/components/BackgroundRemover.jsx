import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { removeBackground } from '@imgly/background-removal';
import { ChevronLeft, Scissors, Loader2, Sparkles, PaintBucket, ArrowRight } from 'lucide-react';

const BackgroundRemover = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [originalImage, setOriginalImage] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [processedImage, setProcessedImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [bgColor, setBgColor] = useState('transparent');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!location.state?.image) {
            navigate('/studio');
        } else {
            setOriginalImage(location.state.image);
            setPrompt(location.state.prompt || '');
        }
    }, [location.state, navigate]);

    const handleRemoveBackground = async () => {
        if (!originalImage) return;
        
        setIsProcessing(true);
        setError(null);
        
        try {
            // @imgly/background-removal returns a Blob
            const imageBlob = await removeBackground(originalImage, {
                progress: (key, current, total) => {
                    console.log(`Downloading AI Models... ${key}: ${current}/${total}`);
                }
            });
            
            // Convert blob to base64
            const reader = new FileReader();
            reader.readAsDataURL(imageBlob);
            reader.onloadend = () => {
                setProcessedImage(reader.result);
                setIsProcessing(false);
            };
        } catch (err) {
            console.error("Background removal failed:", err);
            setError("Failed to remove background. Please try again.");
            setIsProcessing(false);
        }
    };

    const handleContinueToOverlay = () => {
        // Merge background color with the transparent image if a color was selected
        if (bgColor !== 'transparent' && processedImage) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                // Draw background
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                // Draw image on top
                ctx.drawImage(img, 0, 0);
                
                const finalBase64 = canvas.toDataURL('image/png');
                navigate('/studio/overlay', { 
                    state: { 
                        image: finalBase64,
                        prompt: prompt
                    } 
                });
            };
            img.src = processedImage;
        } else {
            navigate('/studio/overlay', { 
                state: { 
                    image: processedImage || originalImage,
                    prompt: prompt
                } 
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <nav className="flex justify-between items-center mb-8 relative z-10 max-w-5xl mx-auto w-full">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/studio', { state: { generatedImage: originalImage, prompt } })} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
                        <Sparkles className="text-cyan-400" /> Studio Lab: Hero Cutout
                    </h1>
                </div>
                
                {/* Independent actions */}
                {processedImage && (
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleContinueToOverlay}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 hover:text-white text-gray-300 rounded-xl font-bold text-sm transition-colors border border-gray-700"
                        >
                            Open in Overlay
                        </button>
                        <a 
                            href={processedImage}
                            download={`hero-cutout-${Date.now()}.png`}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 text-white rounded-xl font-bold text-sm shadow-lg shadow-pink-600/30 cursor-pointer"
                        >
                            Download
                        </a>
                    </div>
                )}
            </nav>

            <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 flex-1">
                
                {/* Controls Sidebar */}
                <div className="lg:col-span-1 space-y-6 bg-gray-800/50 backdrop-blur-md p-6 rounded-2xl border border-gray-700 h-fit">
                    <div>
                        <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                            <Scissors size={20} className="text-pink-500" /> Smart Isolate
                        </h3>
                        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                            Automatically detect and extract the main subject of your generated thumbnail.
                        </p>
                        
                        <button
                            onClick={handleRemoveBackground}
                            disabled={isProcessing || !originalImage}
                            className={`w-full py-3.5 rounded-xl font-bold text-md flex items-center justify-center gap-2 transition-all ${isProcessing
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                                }`}
                        >
                            {isProcessing ? (
                                <><Loader2 size={18} className="animate-spin" /> Analyzing Pixels...</>
                            ) : (
                                <><Scissors size={18} /> Remove Background</>
                            )}
                        </button>
                        
                        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
                    </div>

                    {processedImage && (
                        <div className="pt-6 border-t border-gray-700">
                            <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                                <PaintBucket size={20} className="text-cyan-500" /> Backdrop Color
                            </h3>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="color" 
                                    value={bgColor === 'transparent' ? '#000000' : bgColor}
                                    onChange={(e) => setBgColor(e.target.value)}
                                    className="w-12 h-12 rounded cursor-pointer border-0 bg-transparent"
                                />
                                <button 
                                    onClick={() => setBgColor('transparent')}
                                    className="text-sm text-gray-400 hover:text-white underline"
                                >
                                    Clear Color
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Image Editor Preview window */}
                <div className="lg:col-span-2 bg-gray-900 border-2 border-dashed border-gray-700 rounded-2xl p-4 flex items-center justify-center min-h-[500px] overflow-hidden">
                    {originalImage ? (
                        <div className="relative w-full h-full flex items-center justify-center rounded overflow-hidden checkered-bg"
                             style={{ 
                                 backgroundImage: `repeating-linear-gradient(45deg, #1f2937 25%, transparent 25%, transparent 75%, #1f2937 75%, #1f2937), repeating-linear-gradient(45deg, #1f2937 25%, #111827 25%, #111827 75%, #1f2937 75%, #1f2937)`,
                                 backgroundPosition: `0 0, 10px 10px`,
                                 backgroundSize: `20px 20px`,
                                 backgroundColor: bgColor !== 'transparent' ? bgColor : '#111827'
                             }}>
                            <img 
                                src={processedImage || originalImage} 
                                alt="Studio Preview" 
                                className="max-h-[500px] object-contain drop-shadow-2xl transition-all duration-500 ease-in-out" 
                            />
                        </div>
                    ) : (
                        <p className="text-gray-500">No image loaded.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BackgroundRemover;
