'use client'

import React from 'react'

interface DrawResultProps {
  winningNumbers: number[]
  matchResult: number | null
}

export default function DrawResult({ winningNumbers, matchResult }: DrawResultProps) {
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[#EC8F8D]/40 text-[10px] font-bold uppercase tracking-[0.2em]">Live Draw Result</span>
          <h2 className="text-4xl font-black text-[#F5F5DC] italic tracking-tighter uppercase leading-none mt-1">
            Last Winning <br/> <span className="text-[#853953] drop-shadow-[0_0_8px_rgba(84,18,18,0.8)]">Numbers</span>
          </h2>
        </div>
        
        {matchResult !== null && (
          <div className="text-right">
            <p className="text-[#8B837A] text-[10px] uppercase font-bold">Your Match</p>
            <p className="text-3xl font-serif text-[#F5F5DC]">{matchResult} <span className="text-sm">Hits</span></p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {winningNumbers.length > 0 ? (
          winningNumbers.map((num, i) => (
            <div 
              key={i}
              className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all duration-500
                ${i === winningNumbers.length - 1 
                  ? 'bg-[#541212] text-[#F5F5DC] border-2 border-[#8B5CF6] shadow-[0_0_20px_rgba(84,18,18,0.4)] scale-110' 
                  : 'bg-[#231F1C] border border-[#3E362E] text-[#F5F5DC] hover:border-[#468A9A]'
                }`}
            >
              {num < 10 ? `0${num}` : num}
            </div>
          ))
        ) : (
          [1, 2, 3, 4, 5, 6].map((placeholder) => (
            <div key={placeholder} className="w-14 h-14 md:w-16 md:h-16 rounded-2xl border-2 border-dashed border-[#2C2621] flex items-center justify-center text-[#2C2621]">
              ?
            </div>
          ))
        )}
      </div>
      
      <p className="mt-6 text-[10px] text-[#8B837A] uppercase tracking-widest italic">
        Match all 5 numbers + the Red Ball to win the $1.2M Charity Pot.
      </p>
    </div>
  )
}