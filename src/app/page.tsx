'use client';

import { useState, Suspense } from 'react';
import HeroScene from '@/components/3d/HeroScene'
import Header from '@/components/layout/Header'
import CreativeStudio from '@/components/ai/CreativeStudio'
import ViralDashboard from '@/components/social/ViralDashboard'
import AutopilotSettings from '@/components/social/AutopilotSettings'

export default function Home() {
  const [prefillHook, setPrefillHook] = useState('');
  const [prefillPrompt, setPrefillPrompt] = useState('');
  const [prefillNiche, setPrefillNiche] = useState('');

  const handleSelectTrend = (hook: string, prompt: string, niche: string) => {
    if (hook) setPrefillHook(hook);
    if (prompt) setPrefillPrompt(prompt);
    if (niche) setPrefillNiche(niche);
  };

  return (
    <main className="relative min-h-screen bg-black overflow-x-hidden">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center">
        <HeroScene />
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-6 font-heading">
            UNAPOLOGETICALLY <span className="text-transparent bg-clip-text bg-gold-gradient">AMBITIOUS</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 mb-10 font-body">
            The ultimate toolkit for the new elite. Master money, mindset, and influence with AI-driven dominance.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#viral-trends" className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-center text-black bg-white rounded-full hover:bg-toxic-gold transition-all transform hover:scale-105 shadow-gold-glow">
              JOIN THE INNER CIRCLE
            </a>
            <a href="#ai-tools" className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-center text-white border border-zinc-700 rounded-full hover:bg-zinc-900 transition-all">
              EXPLORE TOOLS
            </a>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-zinc-700 rounded-full flex justify-center p-2">
            <div className="w-1 h-2 bg-zinc-700 rounded-full"></div>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="h-screen bg-black flex items-center justify-center text-white">Loading Dashboard...</div>}>
        {/* Viral Trends Section */}
        <section id="viral-trends" className="relative z-10 py-32 px-4 bg-toxic-black border-t border-zinc-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6 uppercase font-heading">Viral Pulse</h2>
              <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-body">
                Real-time AI trend discovery. We scan the digital landscape so you can dominate it.
              </p>
            </div>
            
            <ViralDashboard onSelectTrend={handleSelectTrend} />
          </div>
        </section>

        {/* Autopilot Section */}
        <section id="autopilot" className="relative z-10 py-32 px-4 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-7xl mx-auto">
            <AutopilotSettings />
          </div>
        </section>

        {/* AI Tools Section */}
        <section id="ai-tools" className="relative z-10 py-32 px-4 bg-black border-t border-zinc-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6 uppercase font-heading">Creative Studio</h2>
              <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-body">
                Forge high-impact narratives and premium visuals in one unified space.
              </p>
            </div>

            <CreativeStudio 
              prefillHook={prefillHook} 
              prefillPrompt={prefillPrompt} 
              prefillNiche={prefillNiche} 
            />
          </div>
        </section>
      </Suspense>

      {/* Footer / About Section */}
      <section id="about" className="relative z-10 py-32 px-4 border-t border-zinc-900 bg-black">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-8 font-heading">TOXIC PREMIUM</h3>
          <p className="text-zinc-500 mb-12 leading-relaxed font-body">
            In a world filled with digital noise and toxic environments, true leadership comes from clarity and focus. 
            Toxic Premium provides the tools to build your presence while protecting your peace.
          </p>
          <div className="flex justify-center gap-8 text-zinc-600 text-sm font-body">
            <span className="hover:text-white transition-colors cursor-pointer">Twitter</span>
            <span className="hover:text-white transition-colors cursor-pointer">Instagram</span>
            <span className="hover:text-white transition-colors cursor-pointer">TikTok</span>
          </div>
        </div>
      </section>
    </main>
  )
}
