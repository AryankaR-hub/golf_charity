'use client'

import React, { useEffect, useState } from 'react'
import { Heart, ShieldCheck } from 'lucide-react'

interface HeaderProps {
  user: any
}

export default function Header({ user }: HeaderProps) {
  const [charityName, setCharityName] = useState<string | null>(null)
  const [isSubscriber, setIsSubscriber] = useState(false)

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return
      const { supabase } = await import('@/lib/supabase')
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('selected_charity_id, subscription_status')
        .eq('id', user.id)
        .single()

      if (profile) {
        // 1. Check Subscription Status
        setIsSubscriber(profile.subscription_status === 'active')

        // 2. Check Charity Status
        if (profile.selected_charity_id) {
          const { data: charity } = await supabase
            .from('charities')
            .select('name')
            .eq('id', profile.selected_charity_id)
            .single()
          
          setCharityName(charity?.name || null)
        }
      }
    }

    fetchProfileData()
  }, [user])

  const handleLogout = async () => {
    const { supabase } = await import('@/lib/supabase')
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  return (
    <header className="flex justify-between items-center p-5 rounded-2xl bg-[#1A1A1A] border border-[#2C2621] shadow-2xl mb-10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-32 h-32 bg-[#468A9A] opacity-[0.03] blur-[60px] pointer-events-none" />

      {/* Left: Profile Info */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative group">
          <div className={`absolute -inset-0.5 rounded-full blur-[2px] opacity-20 group-hover:opacity-100 transition duration-500 ${isSubscriber ? 'bg-gradient-to-r from-[#468A9A] to-[#8B5CF6]' : 'bg-[#2C2621]'}`}></div>
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#F5F5DC]/10 bg-[#231F1C] flex items-center justify-center text-[#F5F5DC] font-bold">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
        </div>

        <div>
          <h1 className="text-lg font-serif font-semibold text-[#F5F5DC] leading-tight tracking-tight flex items-center gap-2">
            Dashboard 
            <span className="text-[#8B837A] font-sans font-normal">/</span> 
            {/* DYNAMIC MEMBERSHIP TAG */}
            <span className={`font-sans text-sm font-bold uppercase tracking-widest italic ${isSubscriber ? 'text-[#468A9A]' : 'text-[#5C544E]'}`}>
              {isSubscriber ? 'Club Member' : 'Guest Tier'}
            </span>
            {isSubscriber && <ShieldCheck size={14} className="text-[#468A9A]" />}
          </h1>
          <p className="text-[11px] font-medium text-[#5C544E] uppercase tracking-[0.2em] mt-0.5">
            {user?.email || 'Guest User'}
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6 relative z-10">
        
        {/* CHARITY BADGE - Only shows if they picked a cause */}
        {charityName && (
          <div className="hidden lg:flex items-center gap-2 bg-[#468A9A]/10 border border-[#468A9A]/20 px-4 py-2 rounded-xl animate-in fade-in slide-in-from-right-4">
            <Heart size={12} className="text-[#468A9A] fill-[#468A9A]" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-widest text-[#468A9A]/60">Active Cause</span>
              <span className="text-[10px] font-bold text-[#F5F5DC] truncate max-w-[100px]">{charityName}</span>
            </div>
          </div>
        )}

        <div className="hidden md:block text-right border-r border-[#2C2621] pr-6">
            <p className="text-[10px] text-[#5C544E] font-bold uppercase tracking-widest">Charity Score</p>
            <p className="text-sm font-bold text-[#F5F5DC]">2,450 pts</p>
        </div>

        <button
          onClick={handleLogout}
          className="group relative px-6 py-2.5 overflow-hidden rounded-xl border border-[#2C2621] bg-transparent transition-all duration-500 hover:border-[#853953]/50 active:scale-95"
        >
          <div className="absolute inset-0 w-0 bg-gradient-to-r from-[#541212] to-[#853953] transition-all duration-500 ease-out group-hover:w-full opacity-90" />
          <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em] text-[#8B837A] group-hover:text-white transition-colors duration-300">
            Sign Out
          </span>
        </button>
      </div>
    </header>
  )
}