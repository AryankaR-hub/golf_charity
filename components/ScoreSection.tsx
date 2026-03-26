'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Trash2, Plus, Target } from 'lucide-react'

interface ScoreSectionProps {
  scores: any[]
  fetchScores: () => void 
}

export default function ScoreSection({ scores, fetchScores }: ScoreSectionProps) {
  const [score, setScore] = useState('')
  const [loading, setLoading] = useState(false)

  const addScore = async () => {
    if (!score || Number(score) < 1 || Number(score) > 45) {
      alert('Score must be between 1 and 45 (Stableford)')
      return
    }

    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setLoading(false)
      return
    }

    const userId = userData.user.id
    const numericScore = Number(score)

    const { data: existing } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (existing && existing.length >= 5) {
      await supabase.from('scores').delete().eq('id', existing[0].id)
    }

    await supabase.from('scores').insert({
      user_id: userId,
      score: numericScore,
      created_at: new Date().toISOString(),
    })

    setScore('')
    await fetchScores()
    setLoading(false)
  }

  const deleteScore = async (scoreId: string) => {
    const { error } = await supabase
      .from('scores')
      .delete()
      .eq('id', scoreId)

    if (!error) {
      await fetchScores()
    }
  }

  return (
    <div className="bg-[#141414] p-10 rounded-[3rem] border border-[#2C2621] shadow-2xl mb-8 relative overflow-hidden group/main">
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#468A9A] opacity-[0.03] blur-[80px] pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-12 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-[#468A9A]" size={18} />
            <span className="text-[10px] text-[#468A9A] font-black uppercase tracking-[0.4em]">Performance Logs</span>
          </div>
          <h2 className="text-4xl font-serif font-bold text-[#F5F5DC] tracking-tight italic">
            Recent <span className="text-[#F5F5DC]/40">Scores</span>
          </h2>
        </div>

        {/* 🏆 NEW HIGH-END INPUT DESIGN */}
        <div className="flex items-center gap-4">
          <div className="relative group/input">
            {/* The Label showing the limit */}
            <span className="absolute -top-3 left-4 bg-[#141414] px-2 text-[8px] font-black text-[#468A9A] uppercase tracking-[0.2em] z-20">
              Range 01 — 45
            </span>
            
            <input
              type="number"
              placeholder="--"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="bg-[#0F0E0E] text-[#F5F5DC] border border-[#2C2621] group-hover/input:border-[#468A9A]/50 px-8 py-5 rounded-2xl outline-none w-32 md:w-40 text-2xl font-mono font-bold transition-all placeholder:opacity-10"
            />
          </div>

          <button
            onClick={addScore}
            disabled={loading}
            className="h-[68px] aspect-square bg-[#F5F5DC] hover:bg-[#468A9A] text-[#0F0E0E] hover:text-[#F5F5DC] rounded-2xl transition-all duration-500 active:scale-90 flex items-center justify-center shadow-[0_0_20px_rgba(245,245,220,0.1)] group/btn"
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-[#0F0E0E] border-t-transparent rounded-full animate-spin" />
            ) : (
               <Plus size={28} className="transition-transform group-hover/btn:rotate-90" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 relative z-10">
        {scores.length > 0 ? (
          scores.map((s, index) => (
            <div
              key={s.id}
              className="group relative bg-[#1A1A1A] border border-[#2C2621] rounded-[2.5rem] p-10 flex flex-col items-center transition-all duration-700 hover:border-[#468A9A]/40 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
            >
              <button 
                onClick={() => deleteScore(s.id)}
                className="absolute top-6 right-6 p-2 rounded-lg bg-[#0F0E0E] border border-[#2C2621] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#853953]/10 hover:border-[#853953]/40"
              >
                <Trash2 size={14} className="text-[#5C544E] hover:text-[#EC8F8D]" />
              </button>

              <span className="text-[9px] font-black text-[#2C2621] uppercase tracking-[0.4em] mb-8">
                Entry 0{index + 1}
              </span>

              <div className="relative mb-6">
                <div className="absolute inset-0 bg-[#468A9A] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                <span className="relative text-6xl font-serif font-black text-[#F5F5DC]">
                  {s.score}
                </span>
              </div>
              
              <div className="h-[1px] w-10 bg-[#2C2621] mb-6" />

              <span className="text-[10px] uppercase tracking-[0.2em] text-[#5C544E] font-black">
                {new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center border border-dashed border-[#2C2621] rounded-[3rem] bg-[#0F0E0E]/30">
            <p className="text-[#2C2621] text-[10px] uppercase font-black tracking-[0.6em] animate-pulse">Awaiting Telemetry Data</p>
          </div>
        )}
      </div>
    </div>
  )
}