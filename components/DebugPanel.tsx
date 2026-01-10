
import React, { useState } from 'react';
import { Upload, Music, Settings, ChevronDown, ChevronUp, CheckCircle, FileAudio } from 'lucide-react';

interface DebugPanelProps {
  voiceStatus: boolean[];
  musicStatus: boolean;
  onVoiceUpload: (index: number, file: File) => void;
  onMusicUpload: (file: File) => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ 
  voiceStatus, 
  musicStatus, 
  onVoiceUpload, 
  onMusicUpload 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, callback: (file: File) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      callback(file);
    }
  };

  return (
    <div className="w-full max-w-md mt-6 px-5 pb-8">
      <div className="bg-white/60 backdrop-blur-md rounded-[1.8rem] border border-white overflow-hidden shadow-md transition-all duration-500">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-6 py-4 text-amber-950/60 font-black text-[10px] uppercase tracking-widest"
        >
          <div className="flex items-center gap-2.5">
            <Settings size={14} />
            演示配置 (调试面板)
          </div>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {isOpen && (
          <div className="px-6 pb-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
            <div className="space-y-3">
              <p className="text-[9px] font-black text-amber-900/40 uppercase tracking-tighter">
                上传 Demo 音频文件
              </p>
              
              <div className="grid grid-cols-1 gap-2">
                {[0, 1, 2].map(index => (
                  <label 
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer group ${
                      voiceStatus[index] 
                        ? 'bg-emerald-50 border-emerald-200' 
                        : 'bg-amber-50/50 border-amber-100 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${voiceStatus[index] ? 'bg-emerald-500 text-white' : 'bg-white text-amber-400'}`}>
                        <Upload size={14} />
                      </div>
                      <span className="text-[11px] font-black text-amber-950">
                        语音 {index + 1}
                      </span>
                    </div>
                    
                    {voiceStatus[index] ? (
                      <div className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle size={12} />
                        <span className="text-[9px] font-black uppercase">已加载</span>
                      </div>
                    ) : (
                      <span className="text-[9px] font-bold text-amber-300 uppercase">未准备</span>
                    )}
                    
                    <input 
                      type="file" 
                      accept="audio/*" 
                      className="hidden" 
                      onChange={(e) => handleFileChange(e, (file) => onVoiceUpload(index, file))}
                    />
                  </label>
                ))}

                <label 
                  className={`flex items-center justify-between p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer group ${
                    musicStatus 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-amber-50/50 border-amber-100 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${musicStatus ? 'bg-blue-500 text-white' : 'bg-white text-amber-400'}`}>
                      <Music size={14} />
                    </div>
                    <span className="text-[11px] font-black text-amber-950">
                      背景音乐
                    </span>
                  </div>
                  
                  {musicStatus ? (
                    <div className="flex items-center gap-1 text-blue-600">
                      <CheckCircle size={12} />
                      <span className="text-[9px] font-black uppercase">已就绪</span>
                    </div>
                  ) : (
                    <span className="text-[9px] font-bold text-amber-300 uppercase">未准备</span>
                  )}
                  
                  <input 
                    type="file" 
                    accept="audio/*" 
                    className="hidden" 
                    onChange={(e) => handleFileChange(e, onMusicUpload)}
                  />
                </label>
              </div>
            </div>

            <div className="p-3 bg-amber-950/5 rounded-xl border border-amber-950/10">
              <div className="flex items-start gap-2.5">
                <FileAudio size={14} className="text-amber-900 mt-0.5 shrink-0" />
                <p className="text-[9px] text-amber-900/60 leading-relaxed font-medium">
                  <strong>Demo 建议：</strong> 请上传 10-15 秒左右的录音文件。如果未上传，系统将自动使用 AI 语音合成作为备选。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
