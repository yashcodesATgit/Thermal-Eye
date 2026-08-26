import React from 'react';
import Navbar from '../components/Navbar';
import { BarChart3, Sparkles } from 'lucide-react';

export default function AnalyticsPage(): React.JSX.Element {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080C14] text-[#E8EDF5]">
      <Navbar />

      <main className="flex-1 w-full p-6 overflow-y-auto max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        <div className="bg-[#111827] border border-[#1E2D45] rounded-2xl p-10 max-w-xl w-full shadow-2xl space-y-5">
          <div className="w-14 h-14 rounded-full bg-[#2D7DD2]/10 border border-[#2D7DD2]/30 flex items-center justify-center mx-auto text-[#2D7DD2]">
            <BarChart3 className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D7DD2]/15 border border-[#2D7DD2]/30 text-[#2D7DD2] text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COMING IN NEXT PHASE</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#E8EDF5]">
              ANALYTICS
            </h1>
            <p className="text-sm text-[#7A8FA8] leading-relaxed">
              Advanced thermal anomaly analytics &amp; historical trends intelligence.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#1E2D45] text-left">
            <div className="bg-[#162033]/50 border border-[#1E2D45] p-3 rounded-lg">
              <span className="text-[10px] font-bold text-[#7A8FA8] uppercase block">TOTAL ANOMALIES</span>
              <span className="text-lg font-bold text-[#E8EDF5] mt-1 block">42</span>
            </div>
            <div className="bg-[#162033]/50 border border-[#1E2D45] p-3 rounded-lg">
              <span className="text-[10px] font-bold text-[#7A8FA8] uppercase block">CRITICAL EVENTS</span>
              <span className="text-lg font-bold text-[#FF4444] mt-1 block">8</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
