import React from 'react';
import { Mail, Shield, FileText } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full bg-gray-900 border-t border-gray-800 py-8 px-6 mt-auto">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Left Side: Brand & Copyright */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-1">
                        ThumbGen Master
                    </h2>
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} ThumbGen Master. All rights reserved.
                    </p>
                </div>

                {/* Right Side: Links & Contact */}
                <div className="flex items-center gap-6 text-sm text-gray-400">
                    <a 
                        href="#privacy" 
                        onClick={(e) => { e.preventDefault(); alert("Privacy Policy dummy link"); }}
                        className="hover:text-pink-400 transition-colors flex items-center gap-2"
                    >
                        <Shield size={16} /> Privacy Policy
                    </a>
                    
                    <a 
                        href="#terms" 
                        onClick={(e) => { e.preventDefault(); alert("Terms of Service dummy link"); }}
                        className="hover:text-pink-400 transition-colors flex items-center gap-2"
                    >
                        <FileText size={16} /> Terms of Service
                    </a>

                    <div className="w-px h-6 bg-gray-700 hidden md:block"></div>

                    <a 
                        href="mailto:support@thumbgen.com?subject=App Feedback"
                        className="hover:text-pink-400 transition-colors flex items-center gap-2"
                    >
                        <Mail size={16} /> Feedback
                    </a>

                    <a
                        href="mailto:contact@thumbgen.com?subject=Contact%20Us"
                        className="px-4 py-2 border border-gray-700 hover:border-pink-500 rounded-lg text-gray-300 hover:text-white transition-all shadow-sm"
                    >
                        Contact Us
                    </a>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
