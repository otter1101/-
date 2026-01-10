
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppStatus, AnxietyLog } from './types';
import { MonitoringView } from './components/MonitoringView';
import { ReportModal } from './components/ReportModal';
import { HistoryView } from './components/HistoryView';
import { DebugPanel } from './components/DebugPanel';
import { ShieldCheck, LogOut, ScrollText, PlayCircle } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [isMusicActive, setIsMusicActive] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [currentView, setCurrentView] = useState<'monitor' | 'history'>('monitor');
  const [anxietyLogs, setAnxietyLogs] = useState<AnxietyLog[]>([]);
  
  // Using a Ref for the rotation index ensures it's always up-to-date in the monitoring loop
  // and doesn't cause unnecessary re-renders of the logic.
  const voiceRotationRef = useRef(0);
  
  const [customVoices, setCustomVoices] = useState<(string | null)[]>([null, null, null]);
  const [customMusic, setCustomMusic] = useState<string | null>(null);

  const statusRef = useRef<AppStatus>(AppStatus.IDLE);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);

  const detectionStartTimeRef = useRef<number | null>(null);

  const DB_TRIGGER_THRESHOLD = -30;
  const REQUIRED_DURATION = 2000; 
  const VOICE_DURATION = 13000;   

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (isMusicActive && status !== AppStatus.IDLE) {
      const musicPath = customMusic || '/music.mp3';
      if (!musicAudioRef.current || musicAudioRef.current.src !== musicPath) {
        musicAudioRef.current = new Audio(musicPath);
        musicAudioRef.current.loop = true;
        musicAudioRef.current.volume = 0.25; 
      }
      musicAudioRef.current.play().catch(() => console.log('Music play blocked or file missing'));
    } else {
      musicAudioRef.current?.pause();
    }
    return () => musicAudioRef.current?.pause();
  }, [isMusicActive, status, customMusic]);

  const speakFallback = () => {
    const utterance = new SpeechSynthesisUtterance("注意！宝宝正在焦虑！");
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const triggerAnxiousSequence = useCallback(() => {
    if (statusRef.current === AppStatus.ANXIOUS) return;
    setStatus(AppStatus.ANXIOUS);
    
    // Determine which file to play based on rotation index
    const currentIndex = voiceRotationRef.current;
    const voiceUrl = customVoices[currentIndex];
    const staticFallback = `/owner_${currentIndex + 1}.mp3`;
    
    console.log(`Triggering anxiety alert. Playing voice index: ${currentIndex + 1}`);

    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current.currentTime = 0;
    }

    if (voiceUrl) {
      voiceAudioRef.current = new Audio(voiceUrl);
      voiceAudioRef.current.play().catch(e => {
        console.warn("Custom voice play failed, using fallback", e);
        speakFallback();
      });
    } else {
      voiceAudioRef.current = new Audio(staticFallback);
      voiceAudioRef.current.play().catch(() => {
        speakFallback();
      });
    }

    // Increment and cycle the index (0 -> 1 -> 2 -> 0)
    voiceRotationRef.current = (currentIndex + 1) % 3;

    setAnxietyLogs(prev => [
      ...prev,
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intensity: 90
      }
    ]);
    
    setTimeout(() => {
      if (statusRef.current !== AppStatus.IDLE) {
        setStatus(AppStatus.LISTENING);
        detectionStartTimeRef.current = null;
      }
    }, VOICE_DURATION);
  }, [customVoices]);

  const monitorVolume = useCallback(() => {
    if (!analyserRef.current || statusRef.current !== AppStatus.LISTENING) {
      animationFrameRef.current = requestAnimationFrame(monitorVolume);
      return;
    }

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / bufferLength);
    const currentDb = rms > 0 ? 20 * Math.log10(rms / 255) : -100;

    const now = Date.now();

    if (currentDb > DB_TRIGGER_THRESHOLD) {
      if (!detectionStartTimeRef.current) detectionStartTimeRef.current = now;
      if (now - detectionStartTimeRef.current >= REQUIRED_DURATION) {
        triggerAnxiousSequence();
      }
    } else {
      detectionStartTimeRef.current = null;
    }

    animationFrameRef.current = requestAnimationFrame(monitorVolume);
  }, [triggerAnxiousSequence]);

  const startMonitoring = async () => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      analyserRef.current = audioContextRef.current.createAnalyser();
      const microphone = audioContextRef.current.createMediaStreamSource(stream);
      microphone.connect(analyserRef.current);
      analyserRef.current.fftSize = 512;
      
      setStatus(AppStatus.LISTENING);
      monitorVolume();
    } catch (err) {
      alert('请确保已授予麦克风权限以开启演示。');
    }
  };

  const stopMonitoring = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (voiceAudioRef.current) voiceAudioRef.current.pause();
    if (musicAudioRef.current) musicAudioRef.current.pause();
    setStatus(AppStatus.IDLE);
    setIsMusicActive(false);
    // Reset rotation when stopping for fresh start next time
    voiceRotationRef.current = 0;
  }, []);

  const handleEndGuard = () => {
    stopMonitoring();
    setShowReport(true);
  };

  const handleVoiceUpload = (index: number, file: File) => {
    const url = URL.createObjectURL(file);
    setCustomVoices(prev => {
      const next = [...prev];
      next[index] = url;
      return next;
    });
  };

  const handleMusicUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setCustomMusic(url);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center transition-colors duration-500 overflow-x-hidden relative ${
      status === AppStatus.LISTENING ? 'bg-emerald-50/50' :
      status === AppStatus.ANXIOUS ? 'bg-red-50/50' : 'bg-[#f7f1e3]'
    }`}>
      {/* Top Header */}
      <header className="w-full bg-white/40 backdrop-blur-md border-b border-black/5 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-5 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
              🐶
            </div>
            <div>
              <h2 className="text-[11px] font-black text-amber-950">宠博士·云伴</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentView(currentView === 'monitor' ? 'history' : 'monitor')}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/80 border border-amber-100 rounded-xl font-black text-[10px] text-amber-600 shadow-sm active:scale-95 transition-all"
            >
              {currentView === 'monitor' ? (
                <><ScrollText size={12} /> 情绪记录</>
              ) : (
                <><ShieldCheck size={12} /> 返回守护</>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-md flex-1 flex flex-col items-center py-4 px-5 gap-5">
        {currentView === 'monitor' ? (
          <>
            <MonitoringView 
              status={status} 
              onStart={startMonitoring} 
              analyser={analyserRef.current}
              isMusicActive={isMusicActive}
              onToggleMusic={() => setIsMusicActive(!isMusicActive)}
            />
            
            <div className="flex flex-col items-center gap-3 w-full">
              {status !== AppStatus.IDLE && (
                 <button 
                  onClick={handleEndGuard}
                  className="group flex items-center gap-2 w-full max-w-[220px] justify-center py-3 bg-white/90 border-b-2 border-amber-200 text-amber-900 font-black text-[13px] rounded-[1.2rem] shadow-md active:border-b-0 active:translate-y-0.5 transition-all"
                 >
                   <LogOut size={14} />
                   停止守护并生成日报
                 </button>
              )}
            </div>
            
            <DebugPanel 
              voiceStatus={customVoices.map(v => !!v)}
              musicStatus={!!customMusic}
              onVoiceUpload={handleVoiceUpload}
              onMusicUpload={handleMusicUpload}
            />
          </>
        ) : (
          <HistoryView records={[]} />
        )}
      </main>

      {/* Floating Test Trigger */}
      {status === AppStatus.LISTENING && (
        <button 
          onClick={triggerAnxiousSequence}
          className="fixed bottom-6 right-5 w-10 h-10 bg-amber-950/10 backdrop-blur-md text-amber-900 flex items-center justify-center rounded-full shadow-lg border border-white/40 hover:bg-amber-950/30 transition-all z-50"
          title="测试触发"
        >
          <PlayCircle size={20} />
        </button>
      )}

      {showReport && (
        <ReportModal 
          logs={anxietyLogs} 
          onClose={() => setShowReport(false)} 
        />
      )}
    </div>
  );
};

export default App;
