'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Check, Shield } from 'lucide-react'

interface Props {
  userId: string
}

export default function SubscriptionSection({ userId }: Props) {
  const [type, setType] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)

  const fetchSubscription = async () => {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data) setCurrentPlan(data.plan)
    else setCurrentPlan(null)
  }

  useEffect(() => {
    if (userId) fetchSubscription()
  }, [userId])

  const subscribe = async () => {
    setLoading(true)
    const now = new Date()
    const endDate = new Date()
    endDate.setMonth(now.getMonth() + (type === 'monthly' ? 1 : 12))

    try {
      // 1. Insert into subscriptions table
      await supabase.from('subscriptions').insert({
        user_id: userId,
        plan: type,
        amount: type === 'monthly' ? 100 : 1000,
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
      })

      // 2. CRITICAL: Update the profile status so the Header "Club Member" badge works
      await supabase
        .from('profiles')
        .update({ subscription_status: 'active' })
        .eq('id', userId)

      // 3. Refresh the UI
      window.location.reload() 
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative overflow-hidden bg-[#1A1A1A] border border-[#2C2621] p-6 rounded-[2rem] shadow-2xl transition-all duration-700">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      
      <div className={`absolute -top-10 -left-10 w-40 h-40 blur-[70px] transition-colors duration-1000 ${currentPlan ? 'bg-[#468A9A]/30' : 'bg-[#8B5CF6]/10'}`} />

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-[0.4em] text-[#5C544E] font-black mb-1">Account Tier</span>
            <p className="text-xl font-serif font-bold text-[#F5F5DC] tracking-tight">
              {currentPlan ? `${currentPlan.toUpperCase()} MEMBER` : 'RESTRICTED'}
            </p>
          </div>
          
          {/* REMOVED THE X - Replaced with a Shield Icon */}
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-all duration-500 ${currentPlan ? 'border-[#468A9A] bg-[#468A9A]/10 shadow-[0_0_20px_rgba(70,138,154,0.2)]' : 'border-[#3E362E] bg-[#231F1C]'}`}>
              {currentPlan ? <Check size={16} className="text-[#468A9A]" /> : <Shield size={16} className="text-[#3E362E]" />}
          </div>
        </div>

        {!currentPlan ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-2 bg-[#0F0E0E] p-1 rounded-xl border border-[#2C2621]">
              <button 
                onClick={() => setType('monthly')}
                className={`py-2.5 text-[10px] font-black tracking-widest rounded-lg transition-all ${type === 'monthly' ? 'bg-[#468A9A] text-[#0F0E0E] shadow-lg' : 'text-[#5C544E] hover:text-[#8B837A]'}`}
              >
                MONTHLY
              </button>
              <button 
                onClick={() => setType('yearly')}
                className={`py-2.5 text-[10px] font-black tracking-widest rounded-lg transition-all ${type === 'yearly' ? 'bg-[#468A9A] text-[#0F0E0E] shadow-lg' : 'text-[#5C544E] hover:text-[#8B837A]'}`}
              >
                YEARLY <span className="opacity-60 text-[8px] ml-1">(-20%)</span>
              </button>
            </div>

            <div className="flex items-center justify-between px-2">
              <div>
                <p className="text-[10px] text-[#5C544E] font-bold uppercase tracking-widest mb-1">Pricing</p>
                <p className="text-3xl font-black text-[#F5F5DC]">${type === 'monthly' ? '100' : '1,000'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#468A9A] font-bold uppercase tracking-widest">Full Access</p>
                <p className="text-[10px] text-[#5C544E] font-medium italic">Weekly Draws Included</p>
              </div>
            </div>

            <button
              onClick={subscribe}
              disabled={loading}
              className="group relative w-full py-4 rounded-xl overflow-hidden transition-all duration-300 transform active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-[#231F1C] border border-[#468A9A]/40 group-hover:border-[#468A9A] transition-colors" />
              <div className="absolute inset-0 bg-[#468A9A] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              
              <div className="absolute top-0 left-0 w-2 h-[1px] bg-[#468A9A] group-hover:w-full transition-all duration-500" />
              <div className="absolute bottom-0 right-0 w-2 h-[1px] bg-[#468A9A] group-hover:w-full transition-all duration-500" />

              <span className="relative z-10 font-black text-[10px] uppercase tracking-[0.4em] text-[#F5F5DC]">
                {loading ? 'INITIALIZING...' : 'Elevate Account'}
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in zoom-in-95 duration-500">
            <div className="p-4 bg-[#0F0E0E] rounded-xl border-l-2 border-[#468A9A]">
                <p className="text-[#8B837A] text-[10px] font-medium leading-relaxed">
                  Encryption active. Your membership is verified until <span className="text-[#F5F5DC]">2027</span>. 10% of your fee is currently supporting your chosen cause.
                </p>
            </div>
            <button className="w-full py-3 text-[9px] font-black text-[#5C544E] uppercase tracking-widest hover:text-[#468A9A] transition-colors flex items-center justify-center gap-2">
                TERMINAL / BILLING SETTINGS
            </button>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-4 opacity-20">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#F5F5DC]" />
            <span className="text-[8px] text-[#F5F5DC] font-black tracking-[0.5em]">SECURE</span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#F5F5DC]" />
        </div>
      </div>
    </div>
  )
}