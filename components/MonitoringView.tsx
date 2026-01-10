
import React, { useRef, useEffect } from 'react';
import { AppStatus } from '../types';
import { Mic, Volume2, ShieldCheck, AlertTriangle, Music } from 'lucide-react';

interface MonitoringViewProps {
  status: AppStatus;
  onStart: () => void;
  analyser: AnalyserNode | null;
  isMusicActive: boolean;
  onToggleMusic: () => void;
}

export const MonitoringView: React.FC<MonitoringViewProps> = ({ status, onStart, analyser, isMusicActive, onToggleMusic }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      const color = status === AppStatus.LISTENING ? '#10b981' : (status === AppStatus.ANXIOUS ? '#ef4444' : '#d1d5db');
      ctx.fillStyle = color;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2.2;
        const centerY = canvas.height / 2;
        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight / 2, barWidth, Math.max(8, barHeight), 12);
        ctx.fill();
        x += barWidth + 6;
      }
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [analyser, status]);

  const renderContent = () => {
    switch (status) {
      case AppStatus.IDLE:
        return (
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-56 h-56 bg-white rounded-full flex flex-col items-center justify-center shadow-lg border-[12px] border-amber-50 group">
              <span className="text-[70px] leading-none mb-2 group-hover:scale-110 transition-transform duration-500">😴</span>
              <p className="text-[9px] font-black text-amber-300 uppercase tracking-[0.2em]">Ready to Guard</p>
            </div>
            <button 
              onClick={onStart}
              className="group flex items-center gap-2 bg-[#A68B6D] text-white px-7 py-3 rounded-[1.4rem] font-black text-base shadow-md active:scale-95 transition-all hover:brightness-105"
            >
              <ShieldCheck size={20} className="text-white" />
              开启守护
            </button>
          </div>
        );
      case AppStatus.LISTENING:
        return (
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="w-full bg-white/40 backdrop-blur-sm p-4 rounded-[2rem] border border-white/50 shadow-md flex flex-col items-center justify-center text-center">
               <div className="flex items-center gap-2 mb-1">
                 <Mic size={20} className="text-emerald-500 animate-pulse" />
                 <h2 className="text-xl font-black text-emerald-950">守护中...</h2>
               </div>
               <p className="text-emerald-900/40 font-black uppercase text-[8px] tracking-[0.1em]">Bark Detection Active</p>
            </div>
            <div className="relative w-56 h-56">
              <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center shadow-xl border-[12px] border-emerald-50 z-10">
                <span className="text-[70px]">🐶</span>
                <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-3.5 rounded-2xl shadow-lg border-[3px] border-white">
                  <Mic size={20} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>
        );
      case AppStatus.ANXIOUS:
        return (
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="w-full bg-red-600 text-white p-4 rounded-[2rem] shadow-lg flex flex-col items-center justify-center border-b-[6px] border-red-800 text-center">
               <div className="flex items-center gap-2 mb-1">
                 <AlertTriangle size={20} className="animate-bounce" />
                 <h2 className="text-xl font-black">检测到焦虑！</h2>
               </div>
               <p className="text-red-100 font-black tracking-widest text-[8px] uppercase">
                 Playing Calm Audio
               </p>
            </div>
            <div className="relative w-56 h-56">
               <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center shadow-xl border-[12px] border-red-50 z-10">
                <span className="text-[70px] animate-bounce">😱</span>
                <div className="absolute -top-2 -right-2 bg-red-500 text-white p-3.5 rounded-2xl shadow-lg border-[3px] border-white">
                  <Volume2 size={20} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="relative w-full flex justify-center">
        {renderContent()}
      </div>
      
      <div className="w-full relative px-2">
        {status !== AppStatus.IDLE && (
          <div className="mb-3 flex justify-start">
            <button 
              onClick={onToggleMusic}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-[10px] transition-all shadow-sm active:scale-95 ${
                isMusicActive ? 'bg-blue-600 text-white' : 'bg-white text-amber-950/40 border border-amber-100'
              }`}
            >
              <Music size={12} />
              音乐 {isMusicActive ? '已开启' : '未开启'}
            </button>
          </div>
        )}

        <div className="h-32 w-full relative bg-white/40 backdrop-blur-sm rounded-[2.5rem] border-white/80 border shadow-md overflow-hidden flex items-center justify-center">
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={220} 
            className="w-full h-full opacity-90 px-8"
          />
          {status !== AppStatus.IDLE && (
            <div className="absolute top-2 right-4 flex items-center gap-1 px-3 py-1 bg-white/30 rounded-full border border-white/40">
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[8px] font-black text-amber-950/40 tracking-[0.05em] uppercase">Monitor</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
