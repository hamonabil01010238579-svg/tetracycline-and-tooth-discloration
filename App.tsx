import React, { useState, useEffect, useRef } from 'react';
import { Menu, Printer, ShieldCheck, Share2, Check } from 'lucide-react';
import { generateMedicalResponse } from './services/geminiService';
import { SpeechHandler } from './utils/speechUtils';
import { ChatMessage } from './components/ChatMessage';
import { InputArea } from './components/InputArea';
import { HistorySidebar } from './components/HistorySidebar';
import { Message, MessageRole, ChatSession, Attachment } from './types';
import { WELCOME_MESSAGE } from './constants';

const App: React.FC = () => {
  // State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('default');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechHandler = useRef<SpeechHandler | null>(null);

  // Initialize Speech Handler
  useEffect(() => {
    speechHandler.current = new SpeechHandler(
      (text) => {
        handleSend(text);
      },
      () => setIsListening(false)
    );
  }, []);

  // Initialize Default Session
  useEffect(() => {
    const defaultSession: ChatSession = {
      id: 'default',
      title: 'New Analysis',
      messages: [{
        id: 'welcome',
        role: MessageRole.MODEL,
        content: WELCOME_MESSAGE,
        timestamp: new Date()
      }],
      createdAt: new Date()
    };
    setSessions([defaultSession]);
    
    // Show "Access Granted" toast on mount to welcome the user
    setTimeout(() => {
        showToast("SECURE CONNECTION ESTABLISHED. ALL FEATURES ACTIVE.");
    }, 1000);
  }, []);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: `Analysis #${sessions.length + 1}`,
      messages: [{
        id: `${newId}-welcome`,
        role: MessageRole.MODEL,
        content: WELCOME_MESSAGE,
        timestamp: new Date()
      }],
      createdAt: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleSend = async (text: string, attachment?: Attachment) => {
    if (!text && !attachment) return;

    // 1. Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      content: text,
      attachment: attachment,
      timestamp: new Date()
    };

    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          messages: [...session.messages, userMsg],
          title: session.messages.length <= 1 ? (text.slice(0, 30) || "Image Analysis") : session.title
        };
      }
      return session;
    }));

    setIsLoading(true);

    // 2. Call Gemini
    try {
      const responseText = await generateMedicalResponse(text, attachment);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        content: responseText,
        timestamp: new Date()
      };

      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          return { ...session, messages: [...session.messages, botMsg] };
        }
        return session;
      }));

      if (responseText.length < 300) {
          speechHandler.current?.speak(responseText);
      }

    } catch (error) {
      console.error("Error generating response", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      speechHandler.current?.stop();
    } else {
      speechHandler.current?.start();
      setIsListening(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
      navigator.clipboard.writeText(window.location.href);
      showToast("ACCESS LINK COPIED TO CLIPBOARD");
  };

  return (
    <div className="flex h-screen bg-phantom-900 overflow-hidden font-sans text-gray-200 selection:bg-phantom-accent selection:text-black">
      
      {/* Toast Notification */}
      <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${toastMessage ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
         <div className="bg-phantom-800 border border-phantom-accent/50 text-phantom-accent px-6 py-2 rounded-full shadow-[0_0_20px_rgba(0,243,255,0.2)] flex items-center gap-2 font-mono text-sm">
             <Check size={16} />
             {toastMessage}
         </div>
      </div>

      {/* Sidebar */}
      <HistorySidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => {
          setCurrentSessionId(id);
          if (window.innerWidth < 768) setIsSidebarOpen(false);
        }}
        onNewChat={handleNewChat}
        isOpen={isSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative w-full h-full">
        
        {/* Top Navigation */}
        <header className="h-16 border-b border-gray-800 bg-phantom-900/90 backdrop-blur flex items-center justify-between px-4 z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              <Menu />
            </button>
            <div className="md:hidden flex items-center gap-2">
               <span className="font-mono text-phantom-accent font-bold">PHANTOM</span>
            </div>
            <div className="hidden md:block">
              <h2 className="text-gray-400 text-xs font-mono tracking-widest">MEDICAL INTELLIGENCE UNIT v2.5</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Share Button */}
            <button 
              onClick={handleShare}
              className="p-2 text-gray-400 hover:text-phantom-accent transition-colors"
              title="Share Access Link"
            >
              <Share2 size={20} />
            </button>

            {/* Print Button */}
            <button 
              onClick={handlePrint}
              className="p-2 text-gray-400 hover:text-phantom-accent transition-colors"
              title="Export Report"
            >
              <Printer size={20} />
            </button>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 bg-phantom-800/50 px-3 py-1 rounded-full border border-gray-700">
               <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
               <span className="text-xs font-mono text-gray-400">{isLoading ? 'PROCESSING' : 'ONLINE'}</span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          
          {/* Background Decor */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-10">
             <div className="w-[500px] h-[500px] bg-phantom-glow rounded-full blur-[120px]"></div>
          </div>

          <div className="max-w-4xl mx-auto relative z-0 pb-24">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {isLoading && (
              <div className="flex items-center gap-2 text-phantom-accent font-mono text-xs animate-pulse ml-14 mt-2">
                <div className="w-2 h-2 bg-phantom-accent rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-phantom-accent rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-phantom-accent rounded-full animate-bounce delay-150"></div>
                ANALYZING DATA PATTERNS...
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Disclaimer */}
        <div className="absolute bottom-24 left-0 right-0 pointer-events-none flex justify-center z-10">
           <div className="bg-black/60 backdrop-blur-md text-gray-400 text-[10px] md:text-xs px-4 py-1 rounded-full border border-gray-700 flex items-center gap-2 shadow-lg">
              <ShieldCheck size={12} className="text-yellow-500" />
              <span>Phantom AI assists with information but does not replace professional medical consultation.</span>
           </div>
        </div>

        {/* Input Area */}
        <div className="bg-gradient-to-t from-phantom-900 via-phantom-900 to-transparent pb-4 pt-10 z-20">
          <InputArea 
            onSend={handleSend} 
            isLoading={isLoading} 
            onVoiceStart={toggleVoice}
            isListening={isListening}
          />
        </div>
      </div>
    </div>
  );
};

export default App;