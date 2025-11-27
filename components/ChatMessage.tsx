import React from 'react';
import { Message, MessageRole } from '../types';
import { Bot, User, AlertTriangle, FileText } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === MessageRole.MODEL;
  
  return (
    <div className={`flex w-full mb-6 ${isModel ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isModel ? 'flex-row' : 'flex-row-reverse'} gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] 
          ${isModel ? 'bg-phantom-700 text-phantom-accent border border-phantom-accent/30' : 'bg-phantom-800 text-purple-400 border border-purple-500/30'}`}>
          {isModel ? <Bot size={20} /> : <User size={20} />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col p-4 rounded-2xl border backdrop-blur-sm
          ${isModel 
            ? 'bg-phantom-800/80 border-phantom-accent/20 text-gray-200 rounded-tl-none shadow-[0_4px_20px_rgba(0,243,255,0.05)]' 
            : 'bg-phantom-700/80 border-purple-500/20 text-white rounded-tr-none shadow-[0_4px_20px_rgba(168,85,247,0.05)]'
          }`}>
          
          {/* Attachment Preview */}
          {message.attachment && (
            <div className="mb-3 rounded-lg overflow-hidden border border-gray-700 relative group">
              <img 
                src={message.attachment.data} 
                alt="Medical Attachment" 
                className="max-h-60 w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <FileText className="text-white" />
              </div>
            </div>
          )}

          {/* Text Content */}
          <div className="prose prose-invert prose-sm max-w-none leading-relaxed whitespace-pre-wrap">
             {/* Simple formatting for bolding if markdown parser isn't used */}
             {message.content.split('\n').map((line, i) => (
                <p key={i} className="mb-1 min-h-[1.2em]">{line}</p>
             ))}
          </div>

          {/* Timestamp */}
          <span className="text-[10px] text-gray-500 mt-2 self-end font-mono">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
