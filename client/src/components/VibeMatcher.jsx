import React, { useState, useRef, useEffect } from 'react';
import { Upload, ImageIcon, Sparkles, ChevronLeft, Download, ScanSearch, Wand2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const VibeMatcher = () => {
    const location = useLocation();
    const [imagePreview, setImagePreview] = useState(location.state?.thumbnailBase64 || null);
    const [imageBase64, setImageBase64] = useState(location.state?.thumbnailBase64 || null);
    const [keyword, setKeyword] = useState('');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [finalImage, setFinalImage] = useState(null);
    
    const fileInputRef = useRef(null);

    // 1. Handle File Upload & Base64 Conversion
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setImageBase64(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // 2. Analyze Image to Generate AI Prompt
    const handleAnalyze = async () => {
        if (!imageBase64) return alert('Please upload a reference image first.');
        
        setIsAnalyzing(true);
        try {
            const token = localStorage.getItem('token');
            // Reaching out to the new vision-remix endpoint we created
            const response = await fetch('https://thumb-gen-master.vercel.app/api/vibe-matcher', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ imageBase64, keyword })
            });

            const data = await response.json();
            
            if (response.ok) {
                setGeneratedPrompt(data.prompt);
            } else {
                alert(`Error: ${data.message}`);
                console.error(data.error);
            }
        } catch (error) {
            console.error("Vibe Matcher Analysis Error:", error);
            alert("Failed to connect to backend server for image analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // 3. Forward the edited prompt to the normal /generate endpoint
    const handleGenerateImage = async () => {
        if (!generatedPrompt) return alert('Please analyze an image to generate a prompt, or write one manually.');
        
        setIsGenerating(true);
        try {
            const token = localStorage.getItem('token');
            // Routing it to the original generator we already have running in the system
            const response = await fetch('https://thumb-gen-master.vercel.app/api/generate', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    title: generatedPrompt, 
                    style: 'Cinematic', // Hardcoding default style for consistency
                    aspectRatio: '16:9'
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                setFinalImage(data.image);
            } else {
                alert(`Error: ${data.message}`);
                console.error(data.error);
            }
        } catch (error) {
            console.error("Final Image Generation Error:", error);
            alert("Failed to generate the final image from the prompt.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 relative overflow-hidden flex flex-col">
            {/* Background glow matching the dashboard */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Navbar */}
            <nav className="flex justify-between items-center mb-8 relative z-10 border-b border-gray-800 pb-4 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-4">
                    <a href="/dashboard" className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors border border-transparent hover:border-gray-700">
                        <ChevronLeft size={20} />
                    </a>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
                        <Wand2 className="text-cyan-400" /> Vision Remix
                    </h1>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 w-full flex-1">
                
                {/* Left Column: Image Upload & Vibe Settings */}
                <div className="lg:col-span-5 space-y-6 bg-gray-800/50 backdrop-blur-md p-6 rounded-2xl border border-gray-700 flex flex-col">
                    
                    {/* Image Upload Zone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">1. Upload Reference Image</label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-48 border-2 border-dashed border-gray-600 hover:border-cyan-500 bg-gray-900 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden group"
                        >
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} alt="Reference" className="w-full h-full object-cover opacity-70 group-hover:opacity-40 transition-opacity" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-sm font-medium text-white flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm"><Upload size={16}/> Select Different Image</p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center flex flex-col items-center gap-3 text-gray-500 group-hover:text-cyan-400 transition-colors">
                                    <div className="p-3 bg-gray-800 rounded-full">
                                        <ImageIcon size={28} />
                                    </div>
                                    <p className="text-sm">Click to upload or drag & drop</p>
                                </div>
                            )}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                                accept="image/*"
                            />
                        </div>
                    </div>

                    {/* Keyword / Vibe Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">2. Desired Keyword / Vibe</label>
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="e.g. 'Cyberpunk', 'Make it cinematic', 'Watercolor style'"
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    {/* Analyze Button */}
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !imageBase64}
                        className={`w-full py-3.5 rounded-xl font-bold text-md flex items-center justify-center gap-2 transition-all ${isAnalyzing || !imageBase64
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 shadow-lg shadow-indigo-500/25 text-white border border-indigo-500/50'
                            }`}
                    >
                        {isAnalyzing ? (
                            <span className="animate-pulse flex items-center gap-2"><ScanSearch size={18} className="animate-spin-slow" /> Translating Pixels to Text...</span>
                        ) : (
                            <><ScanSearch size={18} /> Analyze & Extract Prompt</>
                        )}
                    </button>

                    <div className="w-full h-px bg-gray-700/50 my-2"></div>

                    {/* Extracted Prompt Preview */}
                    <div className="flex-1 flex flex-col">
                        <label className="block text-sm font-medium text-gray-300 mb-2">3. Edit AI Generated Prompt</label>
                        <textarea
                            value={generatedPrompt}
                            onChange={(e) => setGeneratedPrompt(e.target.value)}
                            className="w-full flex-1 min-h-[120px] px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none shadow-inner"
                            placeholder="Your extracted image prompt will appear here after analysis. Feel free to tweak it manually..."
                        ></textarea>
                    </div>

                    {/* Final Generate Button */}
                    <button
                        onClick={handleGenerateImage}
                        disabled={isGenerating || !generatedPrompt}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isGenerating || !generatedPrompt
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 shadow-lg shadow-cyan-500/25 text-white border border-cyan-500/50'
                            }`}
                    >
                        {isGenerating ? (
                            <span className="animate-pulse">Generating Remix...</span>
                        ) : (
                            <><Sparkles size={20} /> Generate Thumbnail</>
                        )}
                    </button>
                    
                </div>

                {/* Right Column: Final Image Output Preview */}
                <div className="lg:col-span-7 bg-gray-800/30 backdrop-blur-md border border-gray-700 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[500px]">
                    {finalImage ? (
                        <div className="relative group w-full h-full flex flex-col items-center justify-center">
                            <img src={finalImage} alt="Final Remixed Generation" className="rounded-lg shadow-2xl max-h-[600px] object-contain border border-gray-800" />
                            <a
                                href={finalImage}
                                download="vision-remix.jpg"
                                className="absolute bottom-4 right-4 bg-gray-900/90 backdrop-blur-md hover:bg-cyan-600 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all border border-gray-700 font-medium text-sm shadow-xl"
                            >
                                <Download size={18} /> Download Masterpiece
                            </a>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 flex flex-col items-center gap-5">
                            <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center bg-gray-800/50 shadow-inner">
                                <Sparkles size={36} className="text-gray-600" />
                            </div>
                            <p className="max-w-sm leading-relaxed text-sm">Upload a reference, extract its essence, and generate a brand new remixed thumbnail.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default VibeMatcher;
