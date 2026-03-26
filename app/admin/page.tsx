'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { BarChart3, ShieldAlert, Trophy, Loader2, LayoutDashboard, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = "aarurasetty@gmail.com"; 
// 🚨 Ensure this is false for real random numbers
const TEST_MODE = false; 

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [activePoolCount, setActivePoolCount] = useState<number | null>(null)

  useEffect(() => {
    const initializeAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      // Case-insensitive check for security
      if (user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsAuthorized(true)
        fetchActivePool()
      } else {
        router.push('/dashboard')
      }
    }
    initializeAdmin()
  }, [router])

  const fetchActivePool = async () => {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active');
    setActivePoolCount(count || 0);
  }

  // ✅ FIXED: Bulletproof Random Generator
  // ✅ FIXED: Robust Random Generator
  const generateNumbers = () => {
    // We'll use a local check to ensure no scope errors
    const isTest = TEST_MODE as boolean;

    if (isTest) {
      console.warn("⚠️ TEST_MODE ACTIVE");
      return [1, 2, 3, 10, 20];
    }
    
    const finalNumbers: number[] = [];
    while (finalNumbers.length < 5) {
      const r = Math.floor(Math.random() * 45) + 1;
      // Ensure we don't add the same number twice
      if (!finalNumbers.includes(r)) {
        finalNumbers.push(r);
      }
    }

    return finalNumbers.sort((a, b) => a - b);
  };

  const runDraw = async () => {
    if (!confirm("CRITICAL: Execute Global Draw Protocol? This will notify all winners.")) return
    
    setLoading(true)
    const winningNumbers = generateNumbers();
    const winStrings = winningNumbers.map(n => n.toString());

    try {
      // 1. Save to Database
      const { data: drawData, error: drawErr } = await supabase
        .from('draws')
        .insert({
          draw_date: new Date().toISOString(),
          winning_numbers: winningNumbers,
          status: 'published',
        })
        .select().single()

      if (drawErr) throw drawErr

      // 2. Scan for Winners
      const { data: subscribers } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('subscription_status', 'active');

      let winnersFound: any[] = []

      for (const sub of subscribers || []) {
        const { data: scoreData } = await supabase
          .from('scores')
          .select('score_value') 
          .eq('user_id', sub.id)

        const userStrings = (scoreData || []).map((s: any) => {
          const val = s.score_value ?? s.score;
          return val ? val.toString() : "";
        }).filter(val => val !== "");

        const matched = userStrings.filter(s => winStrings.includes(s))
        
        if (matched.length >= 3) {
          const winnerLabel = sub.email || `MEMBER_${sub.id.slice(0, 5)}`;
          winnersFound.push({ 
            identifier: winnerLabel, 
            matches: matched.length 
          })

          await supabase.from('winners').insert({
            user_id: sub.id,
            draw_id: drawData.id,
            match_count: matched.length,
            status: 'pending'
          })
        }
      }

      setResult({ winningNumbers, winnersList: winnersFound })
      fetchActivePool()

    } catch (err: any) {
      console.error("Protocol Error:", err)
      alert("System Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthorized) return (
    <div className="min-h-screen bg-[#0F0E0E] flex items-center justify-center font-mono text-[#468A9A] tracking-[0.5em] animate-pulse">
      AUTHORIZING...
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0F0E0E] text-[#F5F5DC] p-6 md:p-12 selection:bg-[#468A9A]/30 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation */}
        <div className="flex justify-between items-center mb-10">
          <button 
            onClick={() => router.push('/dashboard')}
            className="group flex items-center gap-3 px-5 py-2.5 bg-[#1A1A1A] border border-[#2C2621] rounded-xl text-[#8B837A] hover:text-[#468A9A] hover:border-[#468A9A]/40 transition-all duration-300"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit to Dashboard</span>
          </button>

          <div className="hidden md:flex items-center gap-3 opacity-40">
            <div className="w-1.5 h-1.5 rounded-full bg-[#468A9A] animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em]">Encrypted Session Active</span>
          </div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-[#2C2621] pb-10 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-[#468A9A]" size={18} />
              <h1 className="text-[10px] font-black uppercase tracking-[0.6em] text-[#468A9A]">Sapphire Authority</h1>
            </div>
            <h2 className="text-5xl font-serif font-black italic tracking-tighter">Command Terminal</h2>
          </div>
          <div className="bg-[#1A1A1A] px-6 py-3 rounded-2xl border border-[#2C2621]">
            <p className="text-[8px] text-[#5C544E] uppercase tracking-widest mb-1">Root User Identified</p>
            <p className="font-mono text-[10px] text-[#F5F5DC]">{ADMIN_EMAIL}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#1A1A1A] border border-[#2C2621] p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <LayoutDashboard size={80} />
               </div>
               <h3 className="text-[10px] font-black text-[#5C544E] uppercase tracking-[0.4em] mb-6">Draw Protocol</h3>
               <button
                onClick={runDraw}
                disabled={loading}
                className="group relative w-full py-6 rounded-2xl bg-[#468A9A] text-[#0F0E0E] font-black uppercase tracking-[0.3em] text-[11px] overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(70,138,154,0.4)] disabled:opacity-20"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" size={16} /> : 'Execute Monthly Draw'}
                </span>
              </button>
            </div>

            <div className="bg-[#141414] border border-[#2C2621] p-8 rounded-[2.5rem] flex flex-col gap-2 transition-all hover:border-[#468A9A]/20">
               <div className="flex items-center gap-3 opacity-40 mb-2">
                 <Trophy size={14} />
                 <span className="text-[9px] font-black uppercase tracking-widest">Global Membership</span>
               </div>
               <div className="flex items-end justify-between">
                 <span className="text-4xl font-serif font-bold text-[#F5F5DC]">{activePoolCount ?? '--'}</span>
                 <span className="text-[9px] text-[#468A9A] font-black uppercase mb-2 tracking-tighter">Active Nodes</span>
               </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {result ? (
              <div className="bg-[#1A1A1A] border border-[#468A9A]/30 p-10 rounded-[3rem] animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#468A9A] opacity-5 blur-[50px] pointer-events-none" />
                
                <div className="flex justify-between items-start mb-10">
                  <h3 className="text-2xl font-serif italic font-bold">Protocol Successful</h3>
                  <div className="text-[10px] font-black bg-[#468A9A]/10 text-[#468A9A] px-4 py-1.5 rounded-full uppercase tracking-widest border border-[#468A9A]/20">Verified Output</div>
                </div>

                <div className="flex flex-wrap gap-4 mb-12">
                  {result.winningNumbers.map((num: number) => (
                    <div key={num} className="w-16 h-16 rounded-2xl bg-[#0F0E0E] border border-[#468A9A]/50 flex items-center justify-center shadow-lg transform hover:-translate-y-1 transition-transform group">
                      <div className="absolute inset-0 bg-[#468A9A] opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl" />
                      <span className="font-serif text-2xl font-black text-[#F5F5DC]">{num < 10 ? `0${num}` : num}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="h-[1px] flex-1 bg-[#2C2621]" />
                    <p className="text-[9px] font-black text-[#5C544E] uppercase tracking-[0.4em]">Identified Winners</p>
                    <span className="h-[1px] flex-1 bg-[#2C2621]" />
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-2 space-y-3">
                    {result.winnersList.length > 0 ? result.winnersList.map((w: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-5 bg-[#0F0E0E] rounded-2xl border border-[#2C2621] hover:border-[#468A9A]/30 transition-colors">
                        <span className="text-xs font-mono font-bold tracking-tight text-[#F5F5DC]/80">{w.identifier}</span>
                        <div className="flex items-center gap-4">
                           <span className="text-[9px] font-black text-[#468A9A] bg-[#468A9A]/10 px-4 py-1.5 rounded-lg uppercase tracking-widest">{w.matches} Matches</span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center p-12 border border-dashed border-[#2C2621] rounded-[2rem]">
                        <p className="text-xs italic text-[#5C544E]">No winning signatures detected in this cycle.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[500px] border border-dashed border-[#2C2621] rounded-[3rem] flex flex-col items-center justify-center text-[#5C544E] group hover:border-[#468A9A]/20 transition-all duration-700">
                  <BarChart3 size={48} className="mb-6 opacity-5 group-hover:opacity-20 transition-opacity duration-700" />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Awaiting Authorization Command</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-[#2C2621] flex justify-center">
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-[10px] text-[#5C544E] hover:text-[#468A9A] transition-all font-black uppercase tracking-[0.6em] flex items-center gap-3 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-2 transition-transform" />
            Close Terminal Session
          </button>
        </div>
      </div>
    </div>
  )
}