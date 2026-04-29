import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Wand2, Image as ImageIcon, Download, Sparkles, Layout, Palette, ChevronDown, ChevronUp, ScanSearch, Users, Scissors } from 'lucide-react';

const Home = () => {
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('Cyberpunk');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    
    // --- NEW FEATURE STATE ---
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [selectedColorScheme, setSelectedColorScheme] = useState('');

    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    const styles = ['Cyberpunk', 'Minimalist', 'Cinematic', 'Anime', 'Photorealistic'];
    const ratios = ['16:9', '1:1', '9:16'];

    useEffect(() => {
        if (location.state?.prefillPrompt) {
            setPrompt(location.state.prefillPrompt);
        }
        if (location.state?.prefillStyle) {
            const matchedStyle = styles.find(s => s.toLowerCase() === location.state.prefillStyle.toLowerCase());
            if (matchedStyle) setStyle(matchedStyle);
        }
    }, [location.state]);

    // --- NEW FEATURE DATA ---
    const colorSchemes = [
        { id: 'cyber-neon', name: 'Cyber Neon', colors: ['bg-pink-500', 'bg-cyan-400', 'bg-purple-600'], promptValue: 'neon pink, electric cyan, and deep purple' },
        { id: 'sunset-glow', name: 'Sunset Glow', colors: ['bg-orange-500', 'bg-red-500', 'bg-yellow-400'], promptValue: 'warm sunset orange, fiery red, and golden yellow' },
        { id: 'monochrome', name: 'Dark Slate', colors: ['bg-gray-900', 'bg-gray-600', 'bg-gray-300'], promptValue: 'monochrome dark slate, charcoal, and subtle silver' },
        { id: 'synthwave', name: 'Retro Synthwave', colors: ['bg-indigo-600', 'bg-fuchsia-500', 'bg-sky-400'], promptValue: 'retro synthwave indigo, vibrant fuchsia, and laser blue' },
        { id: 'earth-tones', name: 'Earth Tones', colors: ['bg-emerald-700', 'bg-amber-700', 'bg-stone-500'], promptValue: 'natural earth tones, deep forest green, amber, and stone' }
    ];

    const handleRefine = () => {
        // We will connect this to your /api/ai/refine endpoint later!
        setPrompt(prompt + " A hyper-realistic, extremely detailed masterpiece, 8k resolution, trending on ArtStation.");
    };

    // THIS IS THE ONLY PART THAT CHANGED: The real API connection!
    const handleGenerate = async (e) => {
        e.preventDefault();
        setIsGenerating(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://thumb-gen-master.vercel.app/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    title: prompt,
                    style: style,
                    aspectRatio: aspectRatio,
                    colorScheme: selectedColorScheme // --- ADDED THIS LINE ---
                })
            });

            const data = await response.json();

            if (response.ok) {
                setGeneratedImage(data.image);
            } else {
                alert(`Error: ${data.message}`);
                console.error(data.error);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            alert("Failed to connect to backend server.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-pink-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>


            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

                {/* Left Column: Controls (Features 1, 2, 3, 4) */}
                <div className="lg:col-span-5 space-y-6 bg-gray-800/50 backdrop-blur-md p-6 rounded-2xl border border-gray-700">

                    {/* Feature 1: Prompt Input */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-200">
                                Your Prompt
                            </label>
                            {/* Feature 2: Auto-Refinement Button */}
                            <button
                                onClick={handleRefine}
                                className="text-xs text-pink-300 hover:text-pink-200 flex items-center gap-1"
                            >
                                <Wand2 size={14} /> Auto-Refine
                            </button>
                        </div>
                        <textarea
                            id="prompt-input"
                            rows="4"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                            placeholder="Describe your thumbnail idea..."
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Feature 3: Style Preset Picker */}
                        <div>
                            <label htmlFor="style-select" className="block text-sm font-medium text-gray-200 mb-2 flex items-center gap-2">
                                <ImageIcon size={16} /> Style
                            </label>
                            <select
                                id="style-select"
                                value={style}
                                onChange={(e) => setStyle(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
                            >
                                {styles.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Feature 4: Aspect Ratio Selector */}
                        <div>
                            <label htmlFor="ratio-select" className="block text-sm font-medium text-gray-200 mb-2 flex items-center gap-2">
                                <Layout size={16} /> Ratio
                            </label>
                            <select
                                id="ratio-select"
                                value={aspectRatio}
                                onChange={(e) => setAspectRatio(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
                            >
                                {ratios.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* --- NEW FEATURE UI: COLOR SCHEME TOGGLE --- */}
                    <div>
                        <button 
                            type="button"
                            aria-expanded={showColorPicker}
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="w-full py-3 px-4 bg-gray-900 border border-gray-600 hover:border-pink-500 rounded-lg flex items-center justify-between text-sm text-gray-200 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Palette size={16} className={selectedColorScheme ? "text-pink-400" : "text-gray-300"} />
                                {selectedColorScheme ? "Color Palette Selected" : "Add Specific Color Palette"}
                            </div>
                            {showColorPicker ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {showColorPicker && (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700 transition-all">
                                <div 
                                    onClick={() => setSelectedColorScheme('')}
                                    className={`cursor-pointer border rounded-lg p-3 flex items-center justify-center transition-all ${
                                        selectedColorScheme === '' ? 'border-pink-500 bg-gray-800' : 'border-gray-600 bg-gray-900 hover:border-gray-400'
                                    }`}
                                >
                                    <span className="text-xs text-gray-400">None (Let AI Decide)</span>
                                </div>
                                
                                {colorSchemes.map((scheme) => (
                                    <div 
                                        key={scheme.id}
                                        onClick={() => setSelectedColorScheme(scheme.promptValue)}
                                        className={`cursor-pointer border rounded-lg p-2 flex flex-col justify-center transition-all ${
                                            selectedColorScheme === scheme.promptValue 
                                            ? 'border-pink-500 bg-gray-800 shadow-md shadow-pink-500/20' 
                                            : 'border-gray-600 bg-gray-900 hover:border-gray-400'
                                        }`}
                                    >
                                        <span className="text-xs font-medium text-gray-200 mb-1.5">{scheme.name}</span>
                                        <div className="flex w-full h-2 rounded overflow-hidden">
                                            {scheme.colors.map((color, idx) => (
                                                <div key={idx} className={`h-full flex-1 ${color}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* ------------------------------------------- */}

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isGenerating || !prompt
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 shadow-lg shadow-pink-500/25 text-white'
                            }`}
                    >
                        {isGenerating ? (
                            <span className="animate-pulse">Generating Magic...</span>
                        ) : (
                            <>Generate Thumbnail <Sparkles size={20} /></>
                        )}
                    </button>
                </div>

                {/* Right Column: Image Preview */}
                <div className="lg:col-span-7 bg-gray-800/30 backdrop-blur-md border border-gray-700 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[400px]">
                    {generatedImage ? (
                        <div className="relative group w-full h-full flex flex-col items-center">
                            <img
                                src={generatedImage}
                                alt="Generated Thumbnail"
                                className="rounded-lg shadow-2xl max-h-[500px] object-contain"
                            />
                            <div className="absolute bottom-4 right-4 flex gap-2">
                                <button
                                    onClick={() => navigate('/studio', { state: { generatedImage, prompt } })}
                                    className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg flex items-center gap-2 transition-all border border-cyan-500 shadow-lg text-sm font-bold"
                                >
                                    <Scissors size={18} /> Open in Studio
                                </button>
                                <a
                                    href={generatedImage}
                                    download="generated-thumbnail.jpg"
                                    className="bg-gray-900/80 backdrop-blur-sm hover:bg-pink-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-all border border-gray-700 text-sm font-bold"
                                >
                                    <Download size={18} /> Download
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 flex flex-col items-center gap-4">
                            <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center">
                                <ImageIcon size={40} className="text-gray-600" />
                            </div>
                            <p>Your generated thumbnail will appear here.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Home;