"use client";
import React, { useRef } from 'react';
import { useTypingStore } from '@/store/useTypingStore';

export default function Upload() {
  const setRawContent = useTypingStore((state) => state.setRawContent);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRawContent(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-sm shadow-xl transition-all hover:border-blue-500/50">
      <h2 className="text-2xl font-bold text-white mb-4">Start Training</h2>
      <p className="text-gray-400 mb-6 text-center">Upload a .txt file to generate your custom typing lessons.</p>
      
      <input
        type="file"
        accept=".txt"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />
      
      <button
        onClick={() => fileInputRef.current.click()}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/20"
      >
        Upload File
      </button>
      
      <div className="mt-4 text-xs text-gray-500">
        Supports .txt format • Minimum 100 characters recommended
      </div>
    </div>
  );
}
