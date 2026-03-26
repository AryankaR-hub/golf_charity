'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Trophy, Users, BarChart3, ShieldAlert, Loader2, Mail } from 'lucide-react'

const ADMIN_EMAIL = "aarurasetty@gmail.com"; 
const TEST_MODE = false; // Set to false when you're ready for the real demo!

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [activePoolCount, setActivePoolCount] = useState<number | null>(null)

  useEffect(() => {
    const initializeAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email === ADMIN_EMAIL) {
        setIsAuthorized(true)
        fetchActivePool()
      } else {
        window.location.href = '/dashboard'
      }
    }
    initializeAdmin()
  }, [])

  const fetchActivePool = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('subscription_status', 'active');
    setActivePoolCount(profiles?.length || 0);
  }

  const generateNumbers = () => {
    if (TEST_MODE) return [1, 2, 3, 10, 20]
    const numbers = new Set<number>()
    while (numbers.size < 5) {
      numbers.add(Math.floor(Math.random() * 45) + 1)
    }
    return Array.from(numbers).sort((a, b) => a - b)
  }

  const runDraw = async () => {
    if (!confirm("Execute System Draw Protocol?")) return
    
    setLoading(true)
    const winningNumbers = generateNumbers();
    // Convert to strings for the "includes" check to be 100% safe
    const winStrings = winningNumbers.map(n => n.toString());

    try {
      const { data: drawData, error: drawErr } = await supabase
        .from('draws')
        .insert({
          draw_date: new Date().toISOString(),
          winning_numbers: winningNumbers,
          status: 'published',
        })
        .select().single()

      if (drawErr) throw drawErr

      const { data: subscribers } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('subscription_status', 'active');

      let winnersFound: any[] = []

      for (const sub of subscribers || []) {
        const { data: scoreData } = await supabase
          .from('scores')
          .select('score')
          .eq('user_id', sub.id)

        // Force both to strings so "1" always matches 1
        const userStrings = (scoreData || []).map(s => s.score.toString())
        const matched = userStrings.filter(s => winStrings.includes(s))
        
        console.log(`User: ${sub.email} | DB: ${userStrings} | Matches: ${matched.length}`)

        if (matched.length >= 3) {
          const winnerLabel = sub.email || `ID: ${sub.id.slice(0, 8)}`;

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

    } catch (err: any) {
      alert("Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthorized) return <div className="p-20 text-center font-mono">LOADING...</div>

  return (
    <div className="min-h-screen bg-[#0F0E0E] text-[#F5F5DC] p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12 flex justify-between items-end border-b border-[#2C2621] pb-8">
        <div>
          <h1 className="text-sm font-black uppercase tracking-[0.6em] text-[#468A9A]">Systems Override</h1>
          <h2 className="text-4xl font-serif font-bold italic">Admin Terminal</h2>
        </div>
        <div className="text-right font-mono text-xs text-[#468A9A]">{ADMIN_EMAIL}</div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <button
            onClick={runDraw}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-[#468A9A] text-[#0F0E0E] font-black uppercase tracking-widest hover:opacity-80 disabled:opacity-20"
          >
            {loading ? 'Processing...' : 'Run Monthly Draw'}
          </button>
          
          <div className="bg-[#1A1A1A] border border-[#2C2621] p-6 rounded-2xl flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-widest text-[#5C544E]">Active Pool</span>
            <span className="font-mono text-[#468A9A]">{activePoolCount} MEMBERS</span>
          </div>
        </div>

        <div className="lg:col-span-2">
          {result ? (
            <div className="bg-[#1A1A1A] border border-[#468A9A]/30 p-8 rounded-[2rem] animate-in fade-in duration-500">
              <h3 className="text-xl font-serif italic mb-6">Draw Results</h3>
              <div className="flex gap-4 mb-10">
                {result.winningNumbers.map((num: number) => (
                  <div key={num} className="w-12 h-12 rounded-full border border-[#468A9A] flex items-center justify-center font-mono text-[#468A9A] text-lg">
                    {num}
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-[#5C544E] uppercase tracking-widest">Winners Ledger</p>
                {result.winnersList.length > 0 ? result.winnersList.map((w: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-[#0F0E0E] rounded-xl border border-[#2C2621]">
                    <span className="text-xs font-mono">{w.identifier}</span>
                    <span className="text-[10px] font-black text-[#468A9A] bg-[#468A9A]/10 px-3 py-1 rounded-full">{w.matches} Matches</span>
                  </div>
                )) : <p className="text-xs italic text-[#5C544E] text-center p-4 border border-dashed border-[#2C2621] rounded-xl">No winners identified.</p>}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] border border-dashed border-[#2C2621] rounded-[2rem] flex flex-col items-center justify-center text-[#5C544E]">
                <BarChart3 size={40} className="mb-4 opacity-10" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Command</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}