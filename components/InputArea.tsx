import React, { useRef, useState } from 'react';
import { Send, Mic, Image as ImageIcon, X, Paperclip } from 'lucide-react';
import { Attachment } from '../types';

interface InputAreaProps {
  onSend: (text: string, attachment?: Attachment) => void;
  isLoading: boolean;
  onVoiceStart: () => void;
  isListening: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading, onVoiceStart, isListening }) => {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<Attachment | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((!text.trim() && !attachment) || isLoading) return;
    onSend(text, attachment);
    setText('');
    setAttachment(undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment({
          type: 'image',
          data: reader.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Attachment Preview Area */}
      {attachment && (
        <div className="mb-2 flex items-center bg-phantom-800/90 border border-phantom-accent/30 rounded-lg p-2 w-fit animate-float">
          <div className="relative w-12 h-12 rounded overflow-hidden mr-3 border border-gray-600">
            <img src={attachment.data} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="mr-3">
             <p className="text-xs text-phantom-accent font-mono">IMAGE ANALYSIS READY</p>
          </div>
          <button 
            onClick={() => setAttachment(undefined)}
            className="p-1 hover:bg-red-500/20 rounded-full text-gray-400 hover:text-red-400 transition"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="relative flex items-end gap-2 bg-phantom-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-2 shadow-[0_0_20px_rgba(0,0,0,0.5)] focus-within:ring-2 focus-within:ring-phantom-accent/50 focus-within:border-transparent transition-all">
        
        {/* File Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-gray-400 hover:text-phantom-accent hover:bg-phantom-800 rounded-full transition-colors"
          title="Upload Medical Image/Prescription"
        >
          <Paperclip size={20} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        {/* Text Input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe symptoms or ask about medications..."
          className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 p-3 max-h-32 resize-none focus:outline-none font-sans text-sm md:text-base custom-scrollbar"
          rows={1}
          style={{ minHeight: '44px' }}
        />

        {/* Voice Button */}
        <button
          onClick={onVoiceStart}
          className={`p-3 rounded-full transition-all duration-300 ${
            isListening 
              ? 'bg-red-500/20 text-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
              : 'text-gray-400 hover:text-phantom-accent hover:bg-phantom-800'
          }`}
          title="Voice Input"
        >
          <Mic size={20} />
        </button>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isLoading || (!text.trim() && !attachment)}
          className={`p-3 rounded-full mb-[1px] transition-all duration-300 ${
            isLoading || (!text.trim() && !attachment)
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-phantom-accent text-phantom-900 hover:bg-cyan-300 hover:shadow-[0_0_15px_rgba(0,243,255,0.6)]'
          }`}
        >
          <Send size={20} />
        </button>
      </div>
      
      <div className="text-center mt-2">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono">
          Secured by Phantom AI Core • Medical Triage Module
        </p>
      </div>
    </div>
  );
};
