'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // This sends the user to /auth as soon as the app loads
    router.push('/auth')
  }, [router])

  return (
    <div className="min-h-screen bg-[#0F0E0E] flex flex-col items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-[#468A9A] border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-[10px] text-[#468A9A] tracking-[0.5em] uppercase">
          Initializing Terminal...
        </p>
      </div>
    </div>
  )
}