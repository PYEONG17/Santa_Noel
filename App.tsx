import React, { useState } from 'react';
import SnowEffect from './components/SnowEffect';
import ChatPanel from './components/ChatPanel';
import SantaMap from './components/SantaMap';
import Countdown from './components/Countdown';
import { Radio, Map, MessageCircle, Gift } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tracker' | 'chat'>('tracker');

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white overflow-hidden flex flex-col">
      <SnowEffect />
      
      {/* Header */}
      <header className="relative z-20 px-6 py-4 flex justify-between items-center border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.6)]">
                <Gift className="text-white w-6 h-6" />
            </div>
            <div>
                <h1 className="font-christmas text-2xl md:text-3xl text-white leading-none">Theo Dõi Ông Già Noel</h1>
                <p className="text-xs text-blue-300 uppercase tracking-widest font-semibold">Trung Tâm Chỉ Huy</p>
            </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex bg-white/5 rounded-full p-1 border border-white/10">
            <button 
                onClick={() => setActiveTab('tracker')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === 'tracker' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-gray-300'}`}
            >
                <Map size={16} /> Bản Đồ
            </button>
            <button 
                onClick={() => setActiveTab('chat')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === 'chat' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-gray-300'}`}
            >
                <MessageCircle size={16} /> Trò Chuyện
            </button>
        </nav>

        <div className="hidden md:block">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-bold animate-pulse">
                <Radio size={12} />
                TÍN HIỆU MẠNH
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 overflow-hidden flex flex-col md:flex-row gap-6 p-4 md:p-6 container mx-auto">
        
        {/* Left/Top Panel: Dashboard Stats & Countdown - Visible on Desktop, condensed on mobile */}
        <aside className="w-full md:w-80 flex flex-col gap-4 md:gap-6 shrink-0 order-2 md:order-1">
            <Countdown />
            
            {/* Nice List Widget (Static for now but visual) */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex-1 backdrop-blur-md hidden md:flex flex-col">
                <h3 className="text-lg font-christmas text-yellow-400 mb-3 border-b border-white/10 pb-2">Ngoan hay Hư?</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Mức độ Hư toàn cầu</span>
                        <span className="text-red-400 font-bold">12%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm mt-4">
                        <span className="text-gray-300">Mức độ Ngoan toàn cầu</span>
                        <span className="text-green-400 font-bold">88%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>

                    <div className="mt-auto pt-4 text-center">
                        <p className="text-xs text-gray-400">Cập nhật hệ thống: Vừa xong</p>
                    </div>
                </div>
            </div>

            {/* Mobile Only: Tab Switcher if screen is small */}
            <div className="md:hidden flex gap-2">
                <button 
                    onClick={() => setActiveTab('tracker')}
                    className={`flex-1 py-3 rounded-xl border font-bold text-sm flex justify-center items-center gap-2 ${activeTab === 'tracker' ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-800 border-white/10 text-gray-400'}`}
                >
                    <Map size={18} /> Theo Dõi
                </button>
                <button 
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-3 rounded-xl border font-bold text-sm flex justify-center items-center gap-2 ${activeTab === 'chat' ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-800 border-white/10 text-gray-400'}`}
                >
                    <MessageCircle size={18} /> Trò Chuyện
                </button>
            </div>
        </aside>

        {/* Center Panel: Map or Chat */}
        <section className="flex-1 bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden relative shadow-2xl order-1 md:order-2">
            {activeTab === 'tracker' ? (
                <SantaMap />
            ) : (
                <div className="h-full">
                    <ChatPanel />
                </div>
            )}
        </section>

      </main>
      
      <footer className="relative z-20 py-2 text-center text-[10px] text-gray-500 bg-slate-950/50 backdrop-blur">
        Được vận hành bởi Kỹ thuật Bắc Cực & Gemini API
      </footer>
    </div>
  );
};

export default App;