'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Clock, Zap, Settings, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AutopilotSettings() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [schedule] = useState(['07:00', '11:00', '15:00', '19:00', '21:00']);
  const [isActivating, setIsActivating] = useState(false);
  const [isForcing, setIsForcing] = useState(false);

  const toggleAutopilot = async () => {
    setIsActivating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsEnabled(!isEnabled);
    setIsActivating(false);
  };

  const forcePostNow = async () => {
    setIsForcing(true);
    try {
      const res = await fetch('/api/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manual: true })
      });
      const data = await res.json();
      if (data.success) {
        alert('Manual post successful! Check your accounts.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsForcing(false);
    }
  };

  return (
    <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl transition-all duration-500 ${isEnabled ? 'bg-toxic-green/10 border border-toxic-green/20' : 'bg-zinc-800 border border-zinc-700'}`}>
            <Zap className={`w-8 h-8 transition-colors duration-500 ${isEnabled ? 'text-toxic-green shadow-green-glow' : 'text-zinc-600'}`} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight font-heading uppercase flex items-center gap-3">
              Autopilot Core
              {isEnabled && (
                <span className="text-[10px] bg-toxic-green/20 text-toxic-green px-2 py-1 rounded-full animate-pulse border border-toxic-green/30">
                  Active
                </span>
              )}
            </h2>
            <p className="text-zinc-500 text-sm">Autonomous AI content generation and publishing engine.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <button 
            onClick={forcePostNow}
            disabled={isForcing}
            className="px-8 py-4 rounded-2xl bg-zinc-800 text-white font-bold text-sm border border-zinc-700 hover:border-toxic-gold transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isForcing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-toxic-gold" />}
            FORCE POST NOW
          </button>
          
          <button 
            onClick={toggleAutopilot}
            disabled={isActivating}
            className={`px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 transition-all transform active:scale-95 ${
              isEnabled 
              ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' 
              : 'bg-white text-black hover:bg-toxic-gold hover:shadow-gold-glow'
            }`}
          >
            {isActivating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isEnabled ? (
              <>
                <Pause className="w-5 h-5" />
                DEACTIVATE AUTOPILOT
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                ACTIVATE AUTOPILOT
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-black/40 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Aggressive Schedule
              </h3>
              <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">5 Posts Per Day</span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {schedule.map(time => (
                <div key={time} className={`px-4 py-3 rounded-xl border font-mono text-sm transition-all duration-500 ${
                  isEnabled ? 'bg-toxic-gold/5 border-toxic-gold/30 text-toxic-gold' : 'bg-zinc-900/50 border-zinc-800 text-zinc-700'
                }`}>
                  {time}
                </div>
              ))}
            </div>
            
            <p className="text-[11px] text-zinc-600 italic">
              AI will automatically analyze current trends 15 minutes before each slot and prepare custom narratives for all connected accounts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800">
              <Settings className="w-4 h-4 text-zinc-600 mb-3" />
              <h4 className="text-white font-bold text-sm mb-1">Dynamic Niche Selection</h4>
              <p className="text-xs text-zinc-500">Autopilot will rotate between Money, Motivation, and Success themes to maximize reach.</p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800">
              <ShieldCheck className="w-4 h-4 text-zinc-600 mb-3" />
              <h4 className="text-white font-bold text-sm mb-1">Safe-Mode Publishing</h4>
              <p className="text-xs text-zinc-500">Every AI post is verified against community guidelines before being sent to social APIs.</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gold-gradient-dark border border-toxic-gold/20 flex flex-col justify-between">
          <div>
            <h3 className="text-white font-bold text-lg mb-2">Dominance Statistics</h3>
            <p className="text-zinc-400 text-xs mb-6">Estimated weekly impact with Autopilot active.</p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">Weekly Posts</span>
                <span className="text-white font-mono font-bold">140</span>
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">Cross-Platform Reach</span>
                <span className="text-toxic-gold font-mono font-bold">~250k+</span>
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">AI Efficiency</span>
                <span className="text-toxic-green font-mono font-bold">99.8%</span>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-black/40 border border-white/5 text-center">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Next Post In</p>
            <p className="text-2xl font-mono text-white font-bold">{isEnabled ? '02:44:12' : '--:--:--'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
