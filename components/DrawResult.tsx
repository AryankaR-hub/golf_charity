'use client'

import React from 'react'
import { Fingerprint, Trophy } from 'lucide-react'

interface DrawResultProps {
  winningNumbers?: number[] // Added '?' for safety
  matchResult: number | null
}

export default function DrawResult({ winningNumbers = [], matchResult }: DrawResultProps) {
  return (
    <div className="relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Fingerprint size={14} className="text-[#468A9A] animate-pulse" />
            <span className="text-[#468A9A] text-[9px] font-black uppercase tracking-[0.4em]">Verified Terminal Output</span>
          </div>
          <h2 className="text-4xl font-serif font-black italic text-[#F5F5DC] tracking-tighter leading-none">
            Official <br/> 
            <span className="text-[#468A9A] drop-shadow-[0_0_15px_rgba(70,138,154,0.3)]">Draw Results</span>
          </h2>
        </div>
        
        {matchResult !== null && matchResult > 0 && (
          <div className="bg-[#468A9A]/10 border border-[#468A9A]/30 px-5 py-3 rounded-2xl animate-in zoom-in duration-500">
            <div className="flex items-center gap-3">
              <Trophy size={16} className="text-[#F5F5DC]" />
              <div>
                <p className="text-[#8B837A] text-[8px] uppercase font-black tracking-widest">Your Match Status</p>
                <p className="text-xl font-serif font-bold text-[#F5F5DC] leading-none">{matchResult} <span className="text-[10px] uppercase italic">Hits</span></p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Numbers Grid */}
      <div className="flex flex-wrap gap-4">
        {winningNumbers.length > 0 ? (
          winningNumbers.map((num, i) => (
            <div 
              key={i}
              className={`group relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center transition-all duration-700
                ${i === winningNumbers.length - 1 
                  ? 'scale-110 z-10' 
                  : 'hover:-translate-y-1'
                }`}
            >
              {/* Background Shapes */}
              <div className={`absolute inset-0 rounded-2xl rotate-45 transition-all duration-500 
                ${i === winningNumbers.length - 1 
                  ? 'bg-[#468A9A] shadow-[0_0_30px_rgba(70,138,154,0.5)] border-2 border-[#F5F5DC]/50' 
                  : 'bg-[#1A1A1A] border border-[#2C2621] group-hover:border-[#468A9A]/50'
                }`} 
              />
              
              {/* Number Text */}
              <span className={`relative z-10 font-serif text-2xl md:text-3xl font-black transition-colors
                ${i === winningNumbers.length - 1 ? 'text-[#0F0E0E]' : 'text-[#F5F5DC]'}`}>
                {num < 10 ? `0${num}` : num}
              </span>
            </div>
          ))
        ) : (
          // Empty State Placeholders (Match the Admin's 5 numbers)
          [1, 2, 3, 4, 5].map((placeholder) => (
            <div key={placeholder} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-dashed border-[#2C2621] flex items-center justify-center">
              <span className="text-[#2C2621] font-serif text-xl">?</span>
            </div>
          ))
        )}
      </div>
      
      {/* Footer Disclaimer */}
      <div className="mt-10 flex items-center gap-4 py-4 border-t border-[#2C2621]">
        <div className="w-1 h-1 rounded-full bg-[#468A9A] animate-ping" />
        <p className="text-[9px] text-[#5C544E] font-black uppercase tracking-[0.3em]">
          Algorithm verified by Sapphire Node Protocol. Match 5 to win the pot.
        </p>
      </div>
    </div>
  )
}