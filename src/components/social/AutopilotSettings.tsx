'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Clock, Zap, Settings, ShieldCheck, Loader2, Key, ExternalLink, Check, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AutopilotSettings() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [schedule] = useState(['07:00', '11:00', '15:00', '19:00', '21:00']);
  const [isActivating, setIsActivating] = useState(false);
  const [isForcing, setIsForcing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [lastResults, setLastResults] = useState<any[] | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('AYRSHARE_API_KEY');
    if (savedKey) {
      setApiKey(savedKey);
      (window as any).NEXT_PUBLIC_AYRSHARE_API_KEY = savedKey;
    }
  }, []);

  const saveApiKey = () => {
    localStorage.setItem('AYRSHARE_API_KEY', apiKey);
    (window as any).NEXT_PUBLIC_AYRSHARE_API_KEY = apiKey;
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const toggleAutopilot = async () => {
    setIsActivating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsEnabled(!isEnabled);
    setIsActivating(false);
  };

  const forcePostNow = async () => {
    if (!apiKey) {
      alert('CRITICAL: Ayrshare API Key is missing. Posting aborted.');
      return;
    }
    setIsForcing(true);
    setLastResults(null);
    try {
      const res = await fetch('/api/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manual: true, apiKey: apiKey })
      });
      const data = await res.json();
      
      if (data.results) {
        setLastResults(data.results);
      }

      if (data.allSuccessful) {
        alert('VICTORY: Content published to ALL platforms.');
      } else if (data.success) {
        alert('PARTIAL SUCCESS: Content published to some platforms. Check individual status below.');
      } else {
        alert('FAILURE: All platform attempts rejected. Check your Ayrshare dashboard or API Key.');
      }
    } catch (e) {
      console.error(e);
      alert('CONNECTION ERROR: The Dominance Engine could not reach the server.');
    } finally {
      setIsForcing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* API Configuration Card */}
      <div className="p-8 rounded-3xl bg-zinc-900/80 border border-toxic-gold/20 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-toxic-gold/10 border border-toxic-gold/20">
            <Key className="w-6 h-6 text-toxic-gold" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-tight">Social Engine Credentials</h3>
            <p className="text-zinc-500 text-xs">Ayrshare API Key is mandatory for real-time publishing.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input 
              type="password"
              placeholder="Paste Ayrshare API Key here..."
              className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-toxic-gold transition-all"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <a 
              href="https://www.ayrshare.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-toxic-gold hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <button 
            onClick={saveApiKey}
            className="px-8 py-4 bg-toxic-gold text-black font-bold rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            {isSaved ? 'AUTHORIZED' : 'SAVE CREDENTIALS'}
          </button>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl transition-all duration-500 ${isEnabled ? 'bg-toxic-green/10 border border-toxic-green/20' : 'bg-zinc-800 border border-zinc-700'}`}>
              <Zap className={`w-8 h-8 transition-colors duration-500 ${isEnabled ? 'text-toxic-green shadow-green-glow' : 'text-zinc-600'}`} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight font-heading uppercase flex items-center gap-3">
                Autopilot Core
              </h2>
              <p className="text-zinc-500 text-sm">Autonomous daily dominance engine.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <button 
              onClick={forcePostNow}
              disabled={isForcing}
              className="px-8 py-4 rounded-2xl bg-white text-black font-bold text-sm hover:bg-toxic-gold transition-all flex items-center gap-2 disabled:opacity-50 group"
            >
              {isForcing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-black group-hover:scale-125 transition-transform" />}
              FORCE POST NOW
            </button>
            
            <button 
              onClick={toggleAutopilot}
              disabled={isActivating}
              className={`px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 transition-all transform active:scale-95 ${
                isEnabled 
                ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' 
                : 'bg-toxic-green/20 border border-toxic-green/30 text-toxic-green hover:bg-toxic-green hover:text-black'
              }`}
            >
              {isEnabled ? 'DEACTIVATE ENGINE' : 'ACTIVATE ENGINE'}
            </button>
          </div>
        </div>

        {/* Results Status Bar */}
        {lastResults && (
          <div className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4">
            {lastResults.map((res: any) => (
              <div key={res.platform} className={`p-4 rounded-xl border flex flex-col gap-2 ${res.success ? 'bg-toxic-green/5 border-toxic-green/20' : 'bg-red-500/5 border-red-500/20'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-zinc-400">{res.platform}</span>
                  {res.success ? <CheckCircle2 className="w-3 h-3 text-toxic-green" /> : <AlertCircle className="w-3 h-3 text-red-500" />}
                </div>
                <p className={`text-xs font-bold ${res.success ? 'text-white' : 'text-red-400'}`}>
                  {res.success ? 'POSTED' : 'FAILED'}
                </p>
                {!res.success && res.error && (
                  <p className="text-[8px] text-red-500 leading-tight line-clamp-2">{res.error}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-black/40 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  POSTING SCHEDULE
                </h3>
                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">5X DAILY</span>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800">
                <ShieldCheck className="w-4 h-4 text-toxic-green mb-3" />
                <h4 className="text-white font-bold text-sm mb-1">Ayrshare Authenticated</h4>
                <p className="text-xs text-zinc-500">Your accounts are bridged through Ayrshare's enterprise-grade API.</p>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800">
                <Settings className="w-4 h-4 text-toxic-gold mb-3" />
                <h4 className="text-white font-bold text-sm mb-1">AI Post Verification</h4>
                <p className="text-xs text-zinc-500">Each post is verified by Gemini AI for premium branding before publishing.</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gold-gradient-dark border border-toxic-gold/20 flex flex-col justify-between">
            <div>
              <h3 className="text-white font-bold text-lg mb-2">Impact Estimates</h3>
              <p className="text-zinc-400 text-xs mb-6">Autonomous stats per week.</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold">Posts</span>
                  <span className="text-white font-mono font-bold">140</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold">Reach</span>
                  <span className="text-toxic-gold font-mono font-bold">~250k+</span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-black/40 border border-white/5 text-center">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Status</p>
              <p className={`text-2xl font-mono font-bold ${isEnabled ? 'text-toxic-green animate-pulse' : 'text-zinc-700'}`}>{isEnabled ? 'READY' : 'OFF'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
