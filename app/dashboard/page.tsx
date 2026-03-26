'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

import Header from '@/components/Header'
import ScoreSection from '@/components/ScoreSection'
import CharitySection from '@/components/CharitySection'
import DrawResult from '@/components/DrawResult'
import SubscriptionSection from '@/components/SubscriptionSection'
import { Trophy, X, ShieldCheck, Loader2, RefreshCcw } from 'lucide-react' 
import { useRouter } from 'next/navigation'

// ✅ MASTER ADMIN OVERRIDE
const ADMIN_EMAIL = 'aarurasetty@gmail.com';

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [scores, setScores] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true) 
  const [scanning, setScanning] = useState(false) 
  const [charities, setCharities] = useState<any[]>([])
  const [winningNumbers, setWinningNumbers] = useState<number[]>([])
  const [matchResult, setMatchResult] = useState<number | null>(null)
  const [winData, setWinData] = useState<any>(null)

  // 📡 DATABASE: Fetch the latest winning numbers array
  const fetchLatestDraw = async () => {
    try {
      const { data, error } = await supabase
        .from('draws')
        .select('winning_numbers')
        .order('draw_date', { ascending: false })
        .limit(1)
        .single()

      if (data && data.winning_numbers) {
        setWinningNumbers(data.winning_numbers)
      }
    } catch (err) {
      console.error("Draw fetch error:", err)
    }
  }

  useEffect(() => {
    setMounted(true)
    
    const initializeDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
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
          supabase.from('winners').select('*').eq('user_id', currentUser.id).eq('status', 'pending').order('created_at', { ascending: false }).limit(1)
        ])

        setProfile(profileRes.data || null)
        setScores(scoresRes.data || [])
        setCharities(charitiesRes.data || [])
        
        if (winnersRes.data && winnersRes.data.length > 0) {
          setWinData(winnersRes.data[0])
        }

        // Load numbers on entry
        await fetchLatestDraw()

      } catch (err) {
        console.error("Initialization error:", err)
      } finally {
        setLoading(false)
      }
    }

    initializeDashboard()

    // 📡 REAL-TIME: Instantly update when Admin runs a draw
    const drawSubscription = supabase
      .channel('public:draws')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'draws' }, (payload) => {
        if (payload.new.winning_numbers) {
          setWinningNumbers(payload.new.winning_numbers)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(drawSubscription)
    }
  }, [])

  // 🖱️ ACTION: Check Draw Button (Now Functional)
  const handleManualCheck = async () => {
    if (profile?.subscription_status !== 'active') return;
    setScanning(true)
    
    // UI "Scanning" feel
    setTimeout(async () => {
      await fetchLatestDraw()
      if (user) await fetchScores(user.id)
      setScanning(false)
    }, 1200)
  }

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

  if (!mounted || loading) return (
    <div className="min-h-screen bg-[#0F0E0E] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-2 border-[#468A9A]/30 border-t-[#F5F5DC] rounded-full animate-spin"></div>
        <p className="text-[10px] uppercase tracking-[0.5em] text-[#5C544E]">Syncing Terminal...</p>
    </div>
  )

  const isSubscriber = profile?.subscription_status === 'active'
  
  // ✅ ADMIN CHECK: Matches your correct email
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <div className="min-h-screen bg-[#0F0E0E] text-[#E5E5DB] font-sans pb-20 selection:bg-[#468A9A]/30">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8">
        
        {/* 🏆 ADMIN ACCESS PANEL */}
        {isAdmin && (
          <div className="mb-6 flex justify-end">
            <button 
              onClick={() => router.push('/admin')}
              className="group flex items-center gap-3 px-6 py-3 bg-[#468A9A]/10 border border-[#468A9A]/40 rounded-2xl text-[#468A9A] hover:bg-[#468A9A] hover:text-[#0F0E0E] transition-all duration-500 font-black text-[10px] tracking-[0.3em]"
            >
              <ShieldCheck size={16} className="group-hover:rotate-12 transition-transform" />
              COMMAND CENTER
            </button>
          </div>
        )}

        {/* 🎉 WINNER MODAL */}
        {winData && (
          <div className="mb-8 animate-in fade-in zoom-in duration-500 bg-gradient-to-r from-[#468A9A] to-[#F5F5DC] p-[1px] rounded-2xl">
            <div className="bg-[#0F0E0E] rounded-[15px] p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-[#468A9A]/10 p-2 rounded-lg">
                  <Trophy className="text-[#468A9A]" size={20} />
                </div>
                <div>
                  <p className="font-black text-[10px] uppercase tracking-[0.2em] text-[#468A9A]">Winner Detected</p>
                  <p className="text-xs text-[#F5F5DC] opacity-80">Cycle Match: {winData.match_count} Hits</p>
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
                  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md bg-[#0F0E0E]/60 p-6 text-center rounded-[3rem]">
                    <h3 className="font-serif text-2xl font-bold text-[#F5F5DC] mb-2">Restricted Access</h3>
                    <p className="text-[#8B837A] text-sm max-w-xs mb-6">Activate membership to view draw results.</p>
                  </div>
                )}

                <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#468A9A] opacity-[0.05] blur-[120px] pointer-events-none" />
                
                {/* 🎯 Draw Result Rendering */}
                <DrawResult winningNumbers={winningNumbers} matchResult={matchResult} />
                
                <div className="mt-12 flex flex-col sm:flex-row items-center gap-8 pt-10 border-t border-[#2C2621]">
                    <button
                      onClick={handleManualCheck}
                      disabled={!isSubscriber || scanning}
                      className="group relative overflow-hidden bg-[#0F0E0E] border border-[#468A9A]/50 px-10 py-4 rounded-2xl transition-all hover:border-[#468A9A] disabled:opacity-20"
                    >
                      <span className="relative z-10 text-[#468A9A] group-hover:text-[#F5F5DC] font-black text-[11px] uppercase tracking-[0.4em] flex items-center gap-2">
                        {scanning ? <Loader2 className="animate-spin" size={14} /> : <RefreshCcw size={14} />}
                        {scanning ? 'Updating...' : 'Check Latest Draw'}
                      </span>
                    </button>
                    <div className="flex flex-col items-center sm:items-start opacity-50">
                        <span className="text-[9px] text-[#468A9A] font-black uppercase tracking-[0.4em]">Node Connection: Stable</span>
                    </div>
                </div>
            </section>

            <ScoreSection scores={scores} fetchScores={() => fetchScores(user.id)} />
          </div>

          <div className="lg:col-span-4 space-y-10">
            <SubscriptionSection userId={user?.id} />
            
            <div className="bg-[#1A1A1A] p-10 rounded-[2.5rem] border border-[#2C2621] relative overflow-hidden">
                <h3 className="text-[#5C544E] text-[10px] uppercase tracking-[0.5em] font-black mb-6">Impact Statistics</h3>
                <p className="text-6xl font-serif font-bold text-[#F5F5DC] tracking-tighter mb-2">$12,450</p>
                <div className="mt-6 space-y-3">
                    <div className="w-full bg-[#0F0E0E] h-1 rounded-full overflow-hidden">
                      <div className="bg-[#468A9A] h-full rounded-full w-[65%]" />
                    </div>
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-[#5C544E]">
                      <span>Goal Progress</span>
                      <span>65%</span>
                    </div>
                </div>
            </div>
          </div>

          <div className="lg:col-span-12 mt-12">
            <CharitySection charities={charities} userProfile={profile} />
          </div>
        </main>
      </div>
    </div>
  )
}