'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Shield, Key, Mail, Zap, ArrowRight } from 'lucide-react'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMessage(error.message)
    else setMessage('Verification sent. Check your inbox.')
    setLoading(false)
  }

  const handleLogin = async () => {
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    else window.location.href = '/dashboard'
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Intense Sapphire Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#468A9A] opacity-[0.15] blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#468A9A] opacity-[0.1] blur-[150px] rounded-full" />
      
      <div className="w-full max-w-md relative z-10">
        {/* The Main Card - Shifted to a slightly lighter elevated dark gray */}
        <div className="bg-[#1A1A1A] border border-[#2C2621] p-10 md:p-12 rounded-[3.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
          
          {/* Decorative Top Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#468A9A] to-transparent opacity-50" />

          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-serif font-black text-[#F5F5DC] tracking-tighter mb-2">
              The <span className="text-[#468A9A]">Sapphire</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.8em] text-[#468A9A] font-black ml-2">Club Membership</p>
          </div>

          <div className="space-y-6">
            {/* Email Input Container */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#468A9A] uppercase tracking-[0.3em] ml-1">Member Identity</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2C2621] group-focus-within:text-[#F5F5DC] transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="name@sapphire.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0F0E0E] border border-[#2C2621] focus:border-[#468A9A] pl-14 pr-6 py-5 rounded-2xl text-[#F5F5DC] outline-none transition-all font-medium text-sm placeholder:text-[#2C2621]"
                />
              </div>
            </div>

            {/* Password Input Container */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#468A9A] uppercase tracking-[0.3em] ml-1">Access Key</label>
              <div className="relative group">
                <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2C2621] group-focus-within:text-[#F5F5DC] transition-colors" size={18} />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0F0E0E] border border-[#2C2621] focus:border-[#468A9A] pl-14 pr-6 py-5 rounded-2xl text-[#F5F5DC] outline-none transition-all font-medium text-sm placeholder:text-[#2C2621]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 pt-6">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="group relative w-full bg-[#468A9A] hover:bg-[#F5F5DC] text-[#0F0E0E] py-5 rounded-2xl font-black text-[12px] tracking-[0.4em] transition-all duration-500 shadow-[0_10px_30px_rgba(70,138,154,0.3)] flex items-center justify-center overflow-hidden disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? 'PROCESSING...' : 'AUTHORIZE LOGIN'}
                  {!loading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
                </span>
              </button>
              
              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full bg-transparent border-2 border-[#468A9A]/30 hover:border-[#468A9A] text-[#468A9A] hover:text-[#F5F5DC] py-5 rounded-2xl font-black text-[10px] tracking-[0.4em] transition-all duration-500 disabled:opacity-50"
              >
                CREATE ACCOUNT
              </button>
            </div>
          </div>

          {/* Feedback Message */}
          {message && (
            <div className="mt-8 p-4 bg-[#0F0E0E] border border-[#2C2621] rounded-2xl text-center">
              <p className={`text-[10px] font-black uppercase tracking-widest ${
                message.includes('sent') ? 'text-[#468A9A]' : 'text-red-400'
              }`}>{message}</p>
            </div>
          )}
        </div>
        
        <p className="text-center mt-10 text-[9px] text-[#2C2621] uppercase tracking-[0.5em] font-black">
          Exclusive Access &copy; 2026 SAPPHIRE GOLF
        </p>
      </div>
    </div>
  )
}