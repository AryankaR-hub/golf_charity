'use client'
import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'

// 1. Ensure you are passing 'user' as a prop to this component
export default function Navbar({ user }: { user: any }) {
  const router = useRouter();

  // 2. Use Optional Chaining (?.) to prevent "undefined" crashes
  const isAdmin = user?.email === 'your-admin-email@example.com'; 

  return (
    <nav className="flex items-center justify-between p-4">
      {/* Your other nav items */}
      
      {isAdmin && (
        <button 
          onClick={() => router.push('/admin')}
          className="flex items-center gap-2 px-4 py-2 bg-[#468A9A]/10 border border-[#468A9A]/50 rounded-xl text-[#468A9A] hover:bg-[#468A9A] hover:text-[#0F0E0E] transition-all font-black text-[10px] tracking-widest"
        >
          <ShieldCheck size={14} />
          COMMAND CENTER
        </button>
      )}
    </nav>
  )
}