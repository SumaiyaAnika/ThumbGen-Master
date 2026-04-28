import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Upload, ChevronLeft, Scissors, Paintbrush, ImageIcon, Sparkles, LayoutTemplate } from 'lucide-react';

const Studio = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Image can come from Dashboard generation or local upload
    const [image, setImage] = useState(null);
    const [prompt, setPrompt] = useState('');

    useEffect(() => {
        if (location.state?.generatedImage) {
            setImage(location.state.generatedImage);
        }
        if (location.state?.prompt) {
            setPrompt(location.state.prompt);
        }
    }, [location.state]);

    // Handle Copy-Paste of images anywhere on the page
    useEffect(() => {
        const handlePaste = (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.startsWith('image/')) {
                    const file = items[i].getAsFile();
                    if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            setImage(reader.result);
                            setPrompt(''); // Clear prompt on new manual image paste
                        };
                        reader.readAsDataURL(file);
                    }
                    break; // stop after first image found
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
                // Clear any leftover prompt when specific image is manually uploaded
                setPrompt('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNavigate = (path) => {
        if (!image) {
            alert('Please upload or generate an image first.');
            return;
        }
        navigate(path, { state: { image, prompt } });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <nav className="flex items-center mb-10 relative z-10 max-w-4xl mx-auto w-full border-b border-gray-800 pb-4">
                <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors mr-4">
                    <ChevronLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
                    <Sparkles className="text-cyan-400" /> Studio Lab
                </h1>
            </nav>

            <div className="max-w-4xl mx-auto w-full flex-1 relative z-10 flex flex-col items-center">
                
                {/* 1. Image Source / Uploader */}
                <div className="w-full bg-gray-800/50 backdrop-blur-md p-6 rounded-2xl border border-gray-700 mb-8 flex flex-col items-center justify-center text-center">
                    <h2 className="text-lg font-bold text-gray-200 mb-4">Start with an Image</h2>
                    
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full max-w-lg aspect-video ${image ? 'border-none bg-black' : 'border-2 border-dashed border-gray-600 hover:border-cyan-500 bg-gray-900'} rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group shadow-lg`}
                    >
                        {image ? (
                            <>
                                <img src={image} alt="Workspace" className="w-full h-full object-contain opacity-90 group-hover:opacity-40 transition-opacity" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                                    <p className="text-sm font-medium text-white flex items-center gap-2 bg-gray-900/80 px-4 py-2 rounded-lg backdrop-blur-sm border border-gray-700">
                                        <Upload size={16}/> Choose Different Image
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="text-center flex flex-col items-center gap-3 text-gray-500 group-hover:text-cyan-400 transition-colors py-12">
                                <div className="p-4 bg-gray-800 rounded-full shadow-inner">
                                    <ImageIcon size={32} />
                                </div>
                                <p className="text-sm font-medium">Click to upload or just press <kbd className="bg-gray-800 border border-gray-700 px-1.5 py-0.5 rounded text-xs">Ctrl+V</kbd> to paste</p>
                                <p className="text-xs opacity-70">JPEG, PNG, WebP supported</p>
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

                {/* 2. Up & Down Action Buttons */}
                <div className="w-full max-w-lg space-y-4">
                    <button
                        onClick={() => handleNavigate('/studio/bg-remover')}
                        className={`w-full p-6 flex flex-col sm:flex-row items-center sm:text-left gap-4 rounded-2xl border transition-all ${
                            image ? 'bg-gray-800 hover:bg-gray-700 border-gray-600 hover:border-pink-500 cursor-pointer shadow-lg hover:shadow-xl' : 'bg-gray-900 border-gray-800 opacity-50 cursor-not-allowed'
                        }`}
                    >
                        <div className="p-4 bg-pink-500/20 text-pink-400 rounded-xl">
                            <Scissors size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-100 mb-1">Smart Background Remover</h3>
                            <p className="text-sm text-gray-400">Instantly isolate the hero subject of your image and swap the backdrop color.</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleNavigate('/studio/overlay')}
                        className={`w-full p-6 flex flex-col sm:flex-row items-center sm:text-left gap-4 rounded-2xl border transition-all ${
                            image ? 'bg-gray-800 hover:bg-gray-700 border-gray-600 hover:cyan-500 cursor-pointer shadow-lg hover:shadow-xl' : 'bg-gray-900 border-gray-800 opacity-50 cursor-not-allowed'
                        }`}
                    >
                        <div className="p-4 bg-cyan-500/20 text-cyan-400 rounded-xl">
                            <Paintbrush size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-100 mb-1">Dynamic Overlay Editor</h3>
                            <p className="text-sm text-gray-400">Add high-contrast viral text, shapes, and let AI suggest CTR-boosting emojis.</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleNavigate('/studio/zone-check')}
                        className={`w-full p-6 flex flex-col sm:flex-row items-center sm:text-left gap-4 rounded-2xl border transition-all ${
                            image ? 'bg-gray-800 hover:bg-gray-700 border-gray-600 hover:border-purple-500 cursor-pointer shadow-lg hover:shadow-xl' : 'bg-gray-900 border-gray-800 opacity-50 cursor-not-allowed'
                        }`}
                    >
                        <div className="p-4 bg-purple-500/20 text-purple-400 rounded-xl">
                            <LayoutTemplate size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-100 mb-1">Zone Check</h3>
                            <p className="text-sm text-gray-400">Preview YouTube overlays to ensure your text and face are in the safe zones.</p>
                        </div>
                    </button>
                </div>
                
            </div>
        </div>
    );
};

export default Studio;
