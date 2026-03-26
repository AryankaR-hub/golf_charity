'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

import Header from '@/components/Header'
import ScoreSection from '@/components/ScoreSection'
import CharitySection from '@/components/CharitySection'
import DrawResult from '@/components/DrawResult'
import SubscriptionSection from '@/components/SubscriptionSection'
import { Trophy, X } from 'lucide-react' 

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [scores, setScores] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true) 
  const [charities, setCharities] = useState<any[]>([])
  const [winningNumbers, setWinningNumbers] = useState<number[]>([])
  const [matchResult, setMatchResult] = useState<number | null>(null)
  const [winData, setWinData] = useState<any>(null) // Changed to store actual win object

  useEffect(() => {
    setMounted(true)
    
    const initializeDashboard = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (!session || error) {
        window.location.href = '/auth'
        return
      }

      const currentUser = session.user
      setUser(currentUser)

      try {
        const [profileRes, scoresRes, charitiesRes, winnersRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', currentUser.id).single(),
          supabase.from('scores').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(5),
          supabase.from('charities').select('*'),
          // 1. Fetch the LATEST pending win
          supabase.from('winners').select('*').eq('user_id', currentUser.id).eq('status', 'pending').order('created_at', { ascending: false }).limit(1)
        ])

        setProfile(profileRes.data || null)
        setScores(scoresRes.data || [])
        setCharities(charitiesRes.data || [])
        
        if (winnersRes.data && winnersRes.data.length > 0) {
          setWinData(winnersRes.data[0])
        }
      } catch (err) {
        console.error("Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    initializeDashboard()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        window.location.href = '/auth'
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  // 2. Function to dismiss the win (updates DB so it doesn't show again)
  const dismissWin = async () => {
    if (!winData) return;
    await supabase.from('winners').update({ status: 'claimed' }).eq('id', winData.id);
    setWinData(null);
  }

  const fetchScores = async (userId: string) => {
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)
    setScores(data || [])
  }

  const runDraw = async () => {
    if (profile?.subscription_status !== 'active') return;
    // Note: The Admin handles the real logic now, this is just a UI preview
    const winning = [10, 15, 20, 25, 30]
    setWinningNumbers(winning)
    setMatchResult(null) 
  }

  if (!mounted || loading) return (
    <div className="min-h-screen bg-[#0F0E0E] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-2 border-[#468A9A]/30 border-t-[#F5F5DC] rounded-full animate-spin"></div>
        <p className="text-[10px] uppercase tracking-[0.5em] text-[#5C544E]">Syncing Terminal...</p>
    </div>
  )

  const isSubscriber = profile?.subscription_status === 'active'

  return (
    <div className="min-h-screen bg-[#0F0E0E] text-[#E5E5DB] font-sans pb-20 selection:bg-[#468A9A]/30">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8">
        
        {/* 🎉 IMPROVED WINNER NOTIFICATION */}
        {winData && (
          <div className="mb-8 animate-in fade-in zoom-in duration-500 bg-gradient-to-r from-[#468A9A] to-[#F5F5DC] p-[1px] rounded-2xl shadow-[0_0_30px_rgba(70,138,154,0.3)]">
            <div className="bg-[#0F0E0E] rounded-[15px] p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-[#468A9A]/10 p-2 rounded-lg">
                  <Trophy className="text-[#468A9A]" size={20} />
                </div>
                <div>
                  <p className="font-black text-[10px] uppercase tracking-[0.2em] text-[#468A9A]">Winner Detected</p>
                  <p className="text-xs text-[#F5F5DC] opacity-80">You matched {winData.match_count} numbers in the latest draw!</p>
                </div>
              </div>
              <button onClick={dismissWin} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X size={16} className="text-[#5C544E]" />
              </button>
            </div>
          </div>
        )}

        <header className="mb-12">
          <Header user={user} />
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-12">
            
            <section className="bg-[#1A1A1A] border border-[#2C2621] rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                {!isSubscriber && (
                  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md bg-[#0F0E0E]/60 p-6 text-center">
                    <p className="text-4xl mb-4">🔒</p>
                    <h3 className="font-serif text-2xl font-bold text-[#F5F5DC] mb-2">Member Content Restricted</h3>
                    <p className="text-[#8B837A] text-sm max-w-xs mb-6 font-medium">Please activate your membership in the right panel to access monthly draws.</p>
                  </div>
                )}

                <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#468A9A] opacity-[0.05] blur-[120px] pointer-events-none" />
                <DrawResult winningNumbers={winningNumbers} matchResult={matchResult} />
                
                <div className="mt-12 flex flex-col sm:flex-row items-center gap-8 pt-10 border-t border-[#2C2621]">
                    <button
                      onClick={runDraw}
                      disabled={!isSubscriber}
                      className="group relative w-full sm:w-auto overflow-hidden bg-[#0F0E0E] border border-[#468A9A]/50 px-14 py-5 rounded-2xl transition-all duration-500 hover:border-[#468A9A] hover:shadow-[0_0_30px_rgba(70,138,154,0.3)] active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      {/* The Glowing Background Hover Effect */}
                      <div className="absolute inset-0 bg-[#468A9A] opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                      
                      <span className="relative z-10 text-[#468A9A] group-hover:text-[#F5F5DC] font-black text-[11px] uppercase tracking-[0.4em] transition-colors duration-500">
                        Initialize Draw
                      </span>
                    </button>
                    <div className="flex flex-col items-center sm:items-start">
                        <span className="text-[9px] text-[#468A9A] font-black uppercase tracking-[0.4em] mb-1">Status: Operational</span>
                        <p className="text-sm font-serif text-[#8B837A] italic">Draw results sync with Admin Terminal.</p>
                    </div>
                </div>
            </section>

            <ScoreSection scores={scores} fetchScores={() => fetchScores(user.id)} />
          </div>

          <div className="lg:col-span-4 space-y-10">
            <SubscriptionSection userId={user?.id} />
            
            <div className="bg-[#1A1A1A] p-10 rounded-[2.5rem] border border-[#2C2621] relative overflow-hidden transition-all duration-500 hover:border-[#468A9A]/30 group">
                <div className="absolute -top-4 -right-4 p-8 transition-transform duration-1000 group-hover:rotate-12 group-hover:scale-110 opacity-40">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#468A9A" strokeWidth="1">
                        <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
                    </svg>
                </div>
                <h3 className="text-[#5C544E] text-[10px] uppercase tracking-[0.5em] font-black mb-6">Global Statistics</h3>
                <p className="text-6xl font-serif font-bold text-[#F5F5DC] tracking-tighter mb-2">$12,450</p>
                <p className="text-[10px] text-[#468A9A] font-black uppercase tracking-[0.2em] mb-10 opacity-70">Accumulated Impact</p>
                <div className="space-y-3">
                   <div className="w-full bg-[#0F0E0E] h-1.5 rounded-full overflow-hidden border border-[#2C2621]">
                      <div className="bg-gradient-to-r from-[#2C2621] via-[#468A9A] to-[#F5F5DC] h-full rounded-full w-[65%]" />
                   </div>
                   <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-[#5C544E]">
                      <span>Monthly Target</span>
                      <span className="text-[#F5F5DC]">65%</span>
                   </div>
                </div>
            </div>
          </div>

          <div className="lg:col-span-12 mt-12">
            <div className="flex items-center gap-8 mb-12">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#468A9A] font-black uppercase tracking-[0.4em] mb-2">Inner Circle</span>
                  <h2 className="text-4xl font-serif font-bold text-[#F5F5DC] tracking-tight italic">Active Campaigns</h2>
                </div>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-[#2C2621] to-transparent" />
            </div>
            {/* 3. VIBRANT COLORS FIX: Ensure we aren't passing a grayscale prop here */}
            <CharitySection charities={charities} userProfile={profile} />
          </div>
        </main>
      </div>
    </div>
  )
}