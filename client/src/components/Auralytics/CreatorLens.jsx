import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2, Copy, CheckCircle2, Sparkles, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const CreatorLens = () => {
    const [imagePreview, setImagePreview] = useState(null);
    const [base64Image, setBase64Image] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, analyzing, complete, error
    const [titles, setTitles] = useState([]);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
            setBase64Image(reader.result);
            setTitles([]);
            setStatus('idle');
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setBase64Image(reader.result);
                setTitles([]);
                setStatus('idle');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBrainstorm = async () => {
        if (!base64Image) return;

        setStatus('analyzing');
        setTitles([]);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/creatorlens/reverse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ image: base64Image })
            });

            const data = await response.json();
            
            if (data.success) {
                setTitles(data.titles);
                setStatus('complete');
                toast.success('Brainstorming complete!');
            } else {
                setStatus('error');
                toast.error(data.error || 'Failed to brainstorm titles');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
            toast.error('Network error during analysis');
        }
    };

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in mb-12">
            {/* Header */}
            <div className="text-center space-y-2 mt-4">
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent flex items-center justify-center gap-2">
                    <Target className="text-purple-400" /> CreatorLens Reverse-Brainstorm
                </h2>
                <p className="text-gray-400 text-sm">Upload a compelling thumbnail and let AI reverse-engineer the perfect viral titles.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700 p-6 flex flex-col gap-6 shadow-xl shadow-purple-900/10">
                    <h3 className="text-sm uppercase tracking-widest text-gray-400 font-bold flex items-center gap-2">
                        <UploadCloud size={16} className="text-purple-400"/> Input Thumbnail
                    </h3>
                    <div 
                        className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-colors text-center cursor-pointer min-h-[300px]
                            ${imagePreview ? 'border-pink-500/50 bg-pink-500/5' : 'border-gray-600 hover:border-pink-400 hover:bg-gray-800/60'}`}
                        onClick={() => fileInputRef.current.click()}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            accept="image/*" 
                            className="hidden" 
                        />
                        
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg max-h-[300px]" />
                        ) : (
                            <>
                                <UploadCloud size={48} className="text-pink-400 mb-4" />
                                <p className="text-gray-300 font-medium mb-1">Click or Drag image here</p>
                                <p className="text-gray-500 text-xs">JPEG, PNG up to 10MB</p>
                            </>
                        )}
                    </div>

                    <button 
                        onClick={handleBrainstorm}
                        disabled={!imagePreview || status === 'analyzing'}
                        className="w-full py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-all font-bold text-white shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2"
                    >
                        {status === 'analyzing' ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Analyzing Visual Context...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Brainstorm Viral Titles ✨
                            </>
                        )}
                    </button>
                </div>

                {/* Results Section */}
                <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700 p-6 min-h-[400px] flex flex-col shadow-xl shadow-purple-900/10">
                    <h3 className="text-sm uppercase tracking-widest text-gray-400 font-bold mb-6 flex items-center gap-2">
                        <Sparkles size={16} className="text-pink-400" /> Generated Titles
                    </h3>
                    
                    {status === 'analyzing' ? (
                         <div className="flex-1 flex flex-col items-center justify-center text-pink-400 gap-4">
                            <Loader2 size={40} className="animate-spin" />
                            <p className="text-sm font-medium animate-pulse">Consulting the YouTube Algorithm...</p>
                        </div>
                    ) : titles.length > 0 ? (
                        <div className="flex-1 space-y-3">
                            {titles.map((title, index) => (
                                <div key={index} className="group bg-gray-900/60 p-4 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all flex items-center justify-between gap-4 shadow-sm hover:shadow-purple-900/20 hover:-translate-y-0.5 duration-200">
                                    <span className="text-gray-200 font-medium leading-relaxed">{title}</span>
                                    <button 
                                        onClick={() => copyToClipboard(title, index)}
                                        className="text-gray-400 hover:text-pink-400 transition-colors p-2 rounded-lg hover:bg-gray-800 focus:outline-none flex-shrink-0"
                                        title="Copy to clipboard"
                                    >
                                        {copiedIndex === index ? (
                                            <CheckCircle2 size={20} className="text-emerald-400" />
                                        ) : (
                                            <Copy size={20} />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-4 border-2 border-dashed border-gray-700/50 rounded-xl p-8 bg-gray-900/30">
                            <Sparkles size={40} className="opacity-30" />
                            <p className="text-sm text-center text-gray-500">Upload an image and hit brainstorm to see the magic happen.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreatorLens;
