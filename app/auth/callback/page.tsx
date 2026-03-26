'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      // Look for the code in the URL (standard for Supabase Auth)
      const { error } = await supabase.auth.getSession()
      
      if (error) {
        console.error("Auth error:", error.message)
        router.push('/auth?error=callback_failed')
      } else {
        router.push('/dashboard')
      }
    }

    handleAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-[#0F0E0E] flex items-center justify-center font-mono text-[#468A9A]">
      <p className="animate-pulse uppercase tracking-widest text-xs">Authenticating Token...</p>
    </div>
  )
}