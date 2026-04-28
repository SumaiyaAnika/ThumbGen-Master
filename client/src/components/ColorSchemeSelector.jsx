import React from 'react';
import { Palette } from 'lucide-react';

const ColorSchemeSelector = ({ selectedColor, setSelectedColor }) => {
  // Pre-defined palettes mapped to the exact string we want to send to the AI
  const colorSchemes = [
    { 
      id: 'cyber-neon', 
      name: 'Cyber Neon', 
      colors: ['bg-pink-500', 'bg-cyan-400', 'bg-purple-600'],
      promptValue: 'neon pink, electric cyan, and deep purple'
    },
    { 
      id: 'sunset-glow', 
      name: 'Sunset Glow', 
      colors: ['bg-orange-500', 'bg-red-500', 'bg-yellow-400'],
      promptValue: 'warm sunset orange, fiery red, and golden yellow'
    },
    { 
      id: 'monochrome', 
      name: 'Dark Slate', 
      colors: ['bg-gray-900', 'bg-gray-600', 'bg-gray-300'],
      promptValue: 'monochrome dark slate, charcoal, and subtle silver'
    },
    { 
      id: 'synthwave', 
      name: 'Retro Synthwave', 
      colors: ['bg-indigo-600', 'bg-fuchsia-500', 'bg-sky-400'],
      promptValue: 'retro synthwave indigo, vibrant fuchsia, and laser blue'
    },
    { 
      id: 'earth-tones', 
      name: 'Earth Tones', 
      colors: ['bg-emerald-700', 'bg-amber-700', 'bg-stone-500'],
      promptValue: 'natural earth tones, deep forest green, amber, and stone'
    }
  ];

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
        <Palette size={16} /> Color Scheme
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {colorSchemes.map((scheme) => (
          <div 
            key={scheme.id}
            onClick={() => setSelectedColor(scheme.promptValue)}
            className={`cursor-pointer border rounded-lg p-3 flex items-center justify-between transition-all ${
              selectedColor === scheme.promptValue 
                ? 'border-pink-500 bg-gray-800 shadow-md shadow-pink-500/20' 
                : 'border-gray-600 bg-gray-900 hover:border-gray-400'
            }`}
          >
            <span className="text-sm font-medium text-gray-200">{scheme.name}</span>
            <div className="flex -space-x-1">
              {scheme.colors.map((color, idx) => (
                <div 
                  key={idx} 
                  className={`w-5 h-5 rounded-full border border-gray-800 ${color}`}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorSchemeSelector;