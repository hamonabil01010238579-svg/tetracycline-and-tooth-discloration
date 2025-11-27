import React from 'react';
import { MessageSquare, Plus, Activity, UserCheck } from 'lucide-react';
import { ChatSession } from '../types';

interface HistorySidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat,
  isOpen 
}) => {
  return (
    <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-phantom-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } md:translate-x-0 md:static flex flex-col`}>
      
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-2">
        <Activity className="text-phantom-accent animate-pulse-fast" size={24} />
        <div>
          <h1 className="text-xl font-mono font-bold text-white tracking-wider leading-none">
            PHANTOM
          </h1>
          <p className="text-[10px] text-gray-400 font-mono tracking-widest mt-1">
            Dr.Mohamed Nabil
          </p>
        </div>
      </div>

      {/* New Chat */}
      <div className="p-4">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-phantom-800 hover:bg-phantom-700 text-phantom-accent border border-phantom-accent/20 hover:border-phantom-accent/50 p-3 rounded-lg transition-all duration-300 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          <span className="font-mono text-sm">NEW ANALYSIS</span>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
        <div className="space-y-1">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors text-sm ${
                currentSessionId === session.id 
                  ? 'bg-phantom-800 text-white border-l-2 border-phantom-accent' 
                  : 'text-gray-400 hover:bg-phantom-800/50 hover:text-gray-200'
              }`}
            >
              <MessageSquare size={16} className={currentSessionId === session.id ? 'text-phantom-accent' : 'text-gray-600'} />
              <span className="truncate">{session.title}</span>
            </button>
          ))}
          
          {sessions.length === 0 && (
             <div className="text-center p-4 text-gray-600 text-xs font-mono mt-10">
               NO RECORDS FOUND
             </div>
          )}
        </div>
      </div>

      {/* Footer / User - Modified to show Global Access */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-500 to-emerald-700 flex items-center justify-center text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]">
            <UserCheck size={16} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm text-gray-200 truncate font-mono">Authorized Guest</p>
            <p className="text-[10px] text-green-400 font-bold tracking-wide">FULL FEATURES UNLOCKED</p>
          </div>
        </div>
      </div>
    </div>
  );
};