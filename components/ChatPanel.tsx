import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Message } from '../types';
import { chatWithSanta } from '../services/geminiService';
import { INITIAL_CHAT_MESSAGES } from '../constants';

const ChatPanel: React.FC = () => {
  // Initialize state from localStorage if available
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('santa_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        // JSON.parse leaves dates as strings, we must convert them back to Date objects
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
    return INITIAL_CHAT_MESSAGES;
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('santa_chat_history', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Prepare history for API
    const history = messages.map(m => ({ role: m.role, text: m.text }));
    
    const responseText = await chatWithSanta(history, userMsg.text);

    const santaMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'santa',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, santaMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 bg-red-700/80 flex items-center gap-3 border-b border-red-600/50">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-yellow-400">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Santa&clothing=collarAndSweater&facialHair=beardMajestic&top=winterHat02" alt="Santa" className="w-full h-full" />
        </div>
        <div>
          <h2 className="text-white font-christmas text-xl font-bold">Trò Chuyện Cùng Ông Già Noel</h2>
          <div className="flex items-center gap-1 text-xs text-red-100">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Đang Trực Tuyến
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 rounded-bl-none'
              }`}
            >
              {msg.text}
              <div className={`text-[10px] mt-1 opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 p-3 rounded-2xl rounded-bl-none flex gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-slate-800/50 border-t border-white/5">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi Ông Già Noel điều gì đó..."
            className="w-full bg-slate-900/80 border border-slate-700 text-white rounded-full py-3 pl-4 pr-12 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 bg-red-600 hover:bg-red-500 text-white rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-red-600"
          >
            {isLoading ? <Sparkles size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;