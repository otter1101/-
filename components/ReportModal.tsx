
import React from 'react';
import { X, Clock, Info, Heart, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AnxietyLog } from '../types';

interface ReportModalProps {
  logs: AnxietyLog[];
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ logs, onClose }) => {
  const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');
  const isGoodDay = logs.length === 0;
  const successRate = 87;
  const interventions = logs.length > 0 ? logs.length : 0;
  const peakTime = logs.length > 0 ? logs[0].time : '13:41';

  const successData = [
    { name: '成功', value: successRate },
    { name: '其他', value: 100 - successRate },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-amber-950/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-[#fffdf0] rounded-t-[3rem] sm:rounded-[3rem] p-5 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom duration-500 max-h-[95vh] overflow-y-auto hide-scrollbar border border-amber-100">
        
        <div className="flex justify-between items-center px-1 pt-1">
          <h2 className="text-xl font-black text-[#451a03]">今日守护报告 ({today})</h2>
          <button 
            onClick={onClose}
            className="p-1.5 bg-white/50 rounded-full text-amber-900 transition-all active:scale-90"
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-[#fff9e6] rounded-[2rem] p-4 flex items-center gap-4 border border-[#ffecb3]/50">
          <div className="text-5xl drop-shadow-sm">
            {isGoodDay ? '🐶' : '🥺'}
          </div>
          <div className="flex-1 space-y-0.5">
            <h3 className="text-xl font-black text-[#b45309] flex items-center gap-2">
              <span className="w-2 h-2 bg-[#f59e0b] rounded-full"></span>
              {isGoodDay ? '今日表现完美' : '今日有些小情绪'}
            </h3>
            <p className="text-[13px] text-[#d97706]/70 font-bold leading-relaxed">
              {isGoodDay 
                ? "宝贝今天非常乖巧，保持了平稳的心情。" 
                : "监测到几次明显的焦虑波动，好在AI已成功介入安抚。"}
            </p>
          </div>
        </div>

        {/* Anxiety Timeline Distribution */}
        <div className="bg-white rounded-[2rem] p-5 border border-[#ffecb3]/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-black text-[#451a03] flex items-center gap-2">
              <Clock size={18} className="text-[#f59e0b]" strokeWidth={2.5} />
              焦虑时段分布
            </h4>
            <span className="text-xs font-black text-[#f59e0b]">08:00 - 20:00</span>
          </div>
          
          <div className="relative h-3 w-full bg-[#fff9e6] rounded-full overflow-hidden border border-[#ffecb3]/20">
            {logs.length > 0 ? (
              logs.map((log, i) => {
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
              {logs.length > 0 
                ? `峰值出现在 ${peakTime}，持续了约 3 分钟。可能是刚出门不久不太适应。`
                : "今日宝贝状态极佳，全天候保持了极高的情绪稳定性。"}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* AI Effect */}
          <div className="bg-white rounded-[2rem] p-4 border border-[#ffecb3]/30 shadow-sm flex flex-col items-center">
             <div className="relative w-20 h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={successData} innerRadius={28} outerRadius={38} paddingAngle={0} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                      <Cell fill="#10b981" />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-black text-[#10b981]">{successRate}%</span>
                </div>
              </div>
              <div className="mt-3 text-center space-y-0.5">
                <p className="text-xs font-black text-[#f59e0b]">AI 安抚效果</p>
                <p className="text-[10px] font-bold text-[#451a03]/60">介入 {interventions} 次</p>
                <p className="text-[10px] font-bold text-[#10b981]">成功率 {successRate}%</p>
              </div>
          </div>

          {/* Trend Comparison */}
          <div className="bg-white rounded-[2rem] p-4 border border-[#ffecb3]/30 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-black text-[#f59e0b]">今日趋势对比</p>
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

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 py-1">
           <Heart size={14} fill="#f59e0b" className="text-[#f59e0b]" />
           <p className="text-xs font-bold italic text-[#f59e0b]">
             “明天也要继续守护它哦。—— 宠博士·云伴”
           </p>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-3.5 bg-[#451a03] text-white rounded-[1.8rem] font-black text-sm shadow-xl active:scale-95 transition-all mt-0.5 mb-1"
        >
          确定
        </button>
      </div>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};
