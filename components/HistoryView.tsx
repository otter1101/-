
import React, { useState, useMemo } from 'react';
import { HistoryRecord } from '../types';
import { 
  X, Calendar, Clock, Info, 
  Sparkles, ArrowRight, TrendingDown,
  ShoppingBasket, Heart,
  PieChart as PieChartIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface HistoryViewProps {
  records: HistoryRecord[];
}

const MOCK_MONTHLY_STATS = {
  calmTime: 92,
  anxiousTime: 8,
  hourlyIntensity: [
    5, 2, 2, 2, 2, 2, 10, 30, 85, 70, 40, 20, 
    15, 10, 15, 25, 60, 45, 20, 10, 15, 10, 5, 5
  ]
};

const GENERATED_RECORDS: HistoryRecord[] = [
  { 
    date: '2024.03.08', 
    status: 'anxious', 
    logs: [{ time: '09:15', intensity: 85 }, { time: '10:30', intensity: 70 }], 
    successRate: 85, 
    totalInterventions: 4 
  },
  { 
    date: '2024.03.12', 
    status: 'anxious', 
    logs: [{ time: '08:45', intensity: 90 }], 
    successRate: 92, 
    totalInterventions: 2 
  },
  { 
    date: '2024.03.15', 
    status: 'good', 
    logs: [], 
    successRate: 100, 
    totalInterventions: 0 
  },
  { 
    date: '2024.03.22', 
    status: 'anxious', 
    logs: [{ time: '14:20', intensity: 75 }], 
    successRate: 95, 
    totalInterventions: 1 
  },
];

export const HistoryView: React.FC<HistoryViewProps> = ({ records }) => {
  const allRecords = useMemo(() => records.length > 0 ? records : GENERATED_RECORDS, [records]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [activeReport, setActiveReport] = useState<HistoryRecord | null>(null);

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    const dateStr = `2024.03.${day.toString().padStart(2, '0')}`;
    const record = allRecords.find(r => r.date === dateStr);
    if (record) setActiveReport(record);
    else setActiveReport(null);
  };

  const pieData = [
    { name: '平静时光', value: MOCK_MONTHLY_STATS.calmTime, color: '#10b981' },
    { name: '焦虑时光', value: MOCK_MONTHLY_STATS.anxiousTime, color: '#ef4444' }
  ];

  const clockData = MOCK_MONTHLY_STATS.hourlyIntensity.map((intensity, hour) => ({
    hour,
    value: 1,
    intensity,
  }));

  const getHeatmapColor = (intensity: number) => {
    if (intensity > 70) return '#ef4444'; 
    if (intensity > 40) return '#fb923c'; 
    if (intensity > 15) return '#fcd34d'; 
    return '#f0fdf4'; 
  };

  return (
    <div className="w-full max-w-md p-3 space-y-5 pb-32">
      <div className="flex flex-col gap-1 px-1">
        <h2 className="text-xl font-black text-amber-950">情绪深度分析</h2>
        <p className="text-[8px] font-black text-amber-400 uppercase tracking-[0.2em]">Deep Emotional Insights</p>
      </div>

      <section className="bg-white rounded-[2rem] p-5 border border-amber-100 shadow-xl shadow-amber-900/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-amber-500" />
            <h3 className="font-black text-amber-950 text-sm">情绪日历</h3>
          </div>
          <span className="px-2 py-0.5 bg-amber-50 rounded-full text-[8px] font-black text-amber-500">2024 / 03</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <div key={d} className="text-center text-[8px] font-black text-amber-300 py-1">{d}</div>
          ))}
          {Array.from({ length: 31 }, (_, i) => {
            const day = i + 1;
            const dateStr = `2024.03.${day.toString().padStart(2, '0')}`;
            const record = allRecords.find(r => r.date === dateStr);
            const isSelected = selectedDay === day;
            
            return (
              <button 
                key={i} 
                onClick={() => handleDayClick(day)}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg relative transition-all active:scale-90 ${
                  isSelected 
                    ? 'bg-amber-950 text-white shadow-md ring-2 ring-amber-100' 
                    : 'bg-amber-50/50 hover:bg-amber-100/40 border border-transparent'
                }`}
              >
                <span className={`text-[9px] font-black ${isSelected ? 'text-white' : 'text-amber-950/30'}`}>{day}</span>
                {record && (
                  <span className={`text-[10px] absolute -bottom-1 ${record.status === 'anxious' ? 'animate-bounce-slow' : ''}`}>
                    {record.status === 'good' ? '✅' : '🐾'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="bg-white rounded-[2rem] p-5 border border-amber-100 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <PieChartIcon size={16} className="text-amber-500" />
          <h3 className="font-black text-amber-950 text-sm">月度状态占比</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-20 h-20 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={22} outerRadius={36} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1.5">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[9px] font-black text-amber-900/60">{item.name}</span>
                </div>
                <span className="text-[10px] font-black text-amber-950">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-[2rem] p-5 border border-amber-100 shadow-xl overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-amber-500" />
          <h3 className="font-black text-amber-950 text-sm">24小时热力盘</h3>
        </div>
        <div className="relative w-full aspect-square max-w-[160px] mx-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={clockData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                {clockData.map((entry, index) => <Cell key={`cell-${index}`} fill={getHeatmapColor(entry.intensity)} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-center">
             <div>
               <p className="text-[7px] font-black text-amber-400 uppercase tracking-widest leading-none">Peak</p>
               <p className="text-base font-black text-amber-950">09:00</p>
             </div>
          </div>
        </div>
      </section>

      {/* Expert Advice Section */}
      <section className="space-y-3 pt-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#451a03] text-white rounded-full self-start">
            <Sparkles size={8} fill="white" />
            <span className="text-[7px] font-black uppercase tracking-widest">AI INSIGHTS</span>
          </div>
          <h2 className="text-xl font-black text-[#451a03]">宠博士 · 专家建议</h2>
        </div>
        
        <p className="text-[12px] text-[#451a03]/80 leading-relaxed font-bold">
          基于上述的<span className="text-[#FF6B6B]">【焦虑时钟】</span>与<span className="text-[#FF6B6B]">【月度记录】</span>分析，您的爱宠在独处时仍存在一定的分离焦虑倾向。
        </p>

        <div className="bg-[#FFF9F0] p-5 rounded-[2rem] border border-[#FFEBCC] relative shadow-sm">
          <p className="text-[12px] text-[#8B5E3C] leading-[1.5] font-medium">
            单纯的声音安抚只能暂时缓解情绪。专家建议引入<span className="text-[#FF6B6B] font-black">“环境丰容”</span>手段，变“等待”为“探索”。
          </p>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded-md bg-[#FFF9ED] flex items-center justify-center border border-[#FFE7B5]">
               <ShoppingBasket size={12} className="text-[#FFA94D]" />
             </div>
             <span className="text-xs font-black text-[#FFA94D]">推荐方案</span>
          </div>

          <div className="grid gap-3">
            <div className="bg-white rounded-[2rem] p-4 border border-black/5 shadow-md flex gap-3 group hover:shadow-lg transition-all cursor-pointer">
              <div className="w-20 h-20 shrink-0 rounded-[1.5rem] bg-[#FFF5E6] flex items-center justify-center text-3xl shadow-inner overflow-hidden">
                <div className="w-10 h-10 bg-[#D4F14E] rounded-full shadow-md border-2 border-white flex items-center justify-center">
                   <div className="w-8 h-8 border-t-2 border-white/40 rounded-full"></div>
                </div>
              </div>
              <div className="flex flex-col justify-center flex-1">
                <h4 className="font-black text-[#451a03] text-sm">智趣耐咬漏食球</h4>
                <div className="flex mt-0.5">
                  <span className="px-1.5 py-0.5 bg-[#FF6B00] text-white text-[7px] font-black rounded-full">转移注意力</span>
                </div>
                <p className="text-[9px] text-[#451a03]/60 mt-1 leading-relaxed line-clamp-2">
                  专注于获取食物时，大脑会分泌多巴胺，有效覆盖焦虑...
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-4 border border-black/5 shadow-md flex gap-3 group hover:shadow-lg transition-all cursor-pointer">
              <div className="w-20 h-20 shrink-0 rounded-[1.5rem] bg-[#F0F7FF] flex items-center justify-center text-2xl shadow-inner relative">
                <span className="z-10">🥩</span>
              </div>
              <div className="flex flex-col justify-center flex-1">
                <h4 className="font-black text-[#451a03] text-sm">舒缓带/解压肉干</h4>
                <div className="flex mt-0.5">
                  <span className="px-1.5 py-0.5 bg-[#4D94FF] text-white text-[7px] font-black rounded-full">物理安抚</span>
                </div>
                <p className="text-[9px] text-[#451a03]/60 mt-1 leading-relaxed line-clamp-2">
                  模拟母体环境或提供舒缓气味，从物理层面带来安全感...
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Historical Report Modal - Shrunk sections but kept text identical */}
      {activeReport && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-amber-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-[#fffdf0] rounded-t-[3rem] sm:rounded-[3rem] p-5 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom duration-500 max-h-[95vh] overflow-y-auto hide-scrollbar border border-amber-100">
            
            <div className="flex justify-between items-center px-1 pt-1">
              <h2 className="text-xl font-black text-[#451a03]">今日守护报告 ({activeReport.date})</h2>
              <button 
                onClick={() => setActiveReport(null)}
                className="p-1.5 bg-white/50 rounded-full text-amber-900 transition-all active:scale-90"
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>

            <div className={`rounded-[2rem] p-4 flex items-center gap-4 border border-[#ffecb3]/50 ${activeReport.status === 'good' ? 'bg-emerald-50' : 'bg-[#fff9e6]'}`}>
              <div className="text-5xl drop-shadow-sm">
                {activeReport.status === 'good' ? '🐶' : '🥺'}
              </div>
              <div className="flex-1 space-y-0.5">
                <h3 className={`text-xl font-black flex items-center gap-2 ${activeReport.status === 'good' ? 'text-emerald-700' : 'text-[#b45309]'}`}>
                  <span className={`w-2 h-2 rounded-full ${activeReport.status === 'good' ? 'bg-emerald-500' : 'bg-[#f59e0b]'}`}></span>
                  {activeReport.status === 'good' ? '今日表现完美' : '今日有些小情绪'}
                </h3>
                <p className={`text-[13px] font-bold leading-relaxed ${activeReport.status === 'good' ? 'text-emerald-600/70' : 'text-[#d97706]/70'}`}>
                  {activeReport.status === 'good' 
                    ? "宝贝那天表现非常出色，全程保持平静。" 
                    : "监测到几次明显的焦虑波动，好在AI已成功介入安抚。"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-5 border border-[#ffecb3]/30 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-[#451a03] flex items-center gap-2">
                  <Clock size={18} className="text-[#f59e0b]" strokeWidth={2.5} />
                  焦虑时段分布
                </h4>
                <span className="text-sm font-black text-[#f59e0b]">08:00 - 20:00</span>
              </div>
              <div className="relative h-3 w-full bg-[#fff9e6] rounded-full overflow-hidden border border-[#ffecb3]/20">
                {activeReport.logs.length > 0 ? (
                  activeReport.logs.map((log, i) => {
                    const hour = parseInt(log.time.split(':')[0]);
                    const left = ((hour - 8) / 12) * 100;
                    return (
                      <div 
                        key={i} 
                        className="absolute h-full w-4 bg-gradient-to-r from-red-500/10 via-red-500/80 to-red-500/10 blur-[2px]" 
                        style={{ left: `${Math.max(5, Math.min(90, left))}%` }}
                      />
                    );
                  })
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[9px] text-amber-200 font-bold tracking-[0.3em]">全天平静</div>
                )}
              </div>
              <div className="flex items-start gap-2.5 bg-[#fff9e6]/60 p-3.5 rounded-2xl border border-[#ffecb3]/10">
                <Info size={16} className="text-[#f59e0b] mt-0.5 shrink-0" />
                <p className="text-[12px] text-[#b45309]/80 font-bold leading-relaxed">
                  {activeReport.logs.length > 0 
                    ? `峰值出现在 13:41，持续了约 3 分钟。可能是刚出门不久不太适应。`
                    : "那天宝贝状态极佳，全天候保持了极高的情绪稳定性。"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-[2rem] p-4 border border-[#ffecb3]/30 shadow-sm flex flex-col items-center">
                 <div className="relative w-20 h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={[{ name: '成功', value: activeReport.successRate }, { name: '其他', value: 100 - activeReport.successRate }]} innerRadius={28} outerRadius={38} paddingAngle={0} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                          <Cell fill="#10b981" />
                          <Cell fill="#f1f5f9" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-black text-[#10b981]">{activeReport.successRate}%</span>
                    </div>
                  </div>
                  <div className="mt-3 text-center space-y-0.5">
                    <p className="text-sm font-black text-[#f59e0b]">AI 安抚效果</p>
                    <p className="text-[10px] font-bold text-[#451a03]/60">介入 {activeReport.logs.length} 次</p>
                    <p className="text-[10px] font-bold text-[#10b981]">成功率 {activeReport.successRate}%</p>
                  </div>
              </div>

              <div className="bg-white rounded-[2rem] p-4 border border-[#ffecb3]/30 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-sm font-black text-[#f59e0b]">今日趋势对比</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-10 h-8 bg-[#ecfdf5] rounded-lg flex items-center justify-center text-[#10b981]">
                      <TrendingDown size={20} strokeWidth={3} />
                    </div>
                    <span className="text-2xl font-black text-[#10b981]">15%</span>
                  </div>
                </div>
                <p className="text-[10px] text-[#451a03]/50 font-bold leading-tight mt-3">
                  相较于昨日，今日焦虑总时长<span className="text-[#10b981]">下降了 15%</span>。
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 py-1">
               <Heart size={14} fill="#f59e0b" className="text-[#f59e0b]" />
               <p className="text-xs font-bold italic text-[#f59e0b]">
                 “明天也要继续守护它哦。—— 宠博士·云伴”
               </p>
            </div>

            <button 
              onClick={() => setActiveReport(null)}
              className="w-full py-3.5 bg-[#451a03] text-white rounded-[1.8rem] font-black text-sm shadow-xl active:scale-95 transition-all mt-0.5 mb-1"
            >
              确定
            </button>
          </div>
        </div>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
      `}</style>
    </div>
  );
};
