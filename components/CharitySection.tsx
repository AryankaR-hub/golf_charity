'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Charity {
  id: string; name: string; image_url: string; description: string;
  goal_amount: number; raised_amount: number;
}

export default function CharitySection({ charities = [], userProfile }: { charities: Charity[], userProfile?: any }) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isSubscriber = userProfile?.subscription_status === 'active';

  const handleContribute = async (charityId: string, currentRaised: number) => {
    if (!isSubscriber) {
      alert("Membership Required: Please activate your Club Member status in the side panel to support a cause.");
      return;
    }

    if (processingId) return;

    setProcessingId(charityId);
    
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
        window.location.href = '/auth';
        return;
    };

    try {
      await supabase.from('profiles').update({ selected_charity_id: charityId }).eq('id', userId);
      await supabase.from('charities').update({ raised_amount: currentRaised + 10 }).eq('id', charityId);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Synchronization Error: Failed to log your selection.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {charities.map((charity) => {
        const isSupporting = userProfile?.selected_charity_id === charity.id;
        const raised = Number(charity?.raised_amount || 0);
        const goal = Number(charity?.goal_amount || 1);
        const progress = Math.min(Math.round((raised / goal) * 100), 100);
        
        return (
          <div key={charity.id} className={`group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-[#1A1A1A] border ${isSupporting ? 'border-[#468A9A]' : 'border-[#2C2621]'} transition-all duration-500 shadow-2xl`}>
            
            {isSupporting && (
              <div className="absolute top-6 right-6 z-20 bg-[#468A9A] text-[#0F0E0E] text-[10px] font-black px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(70,138,154,0.4)] animate-pulse">
                ACTIVE SUPPORT
              </div>
            )}

            <div className="relative h-64 w-full overflow-hidden">
              <img 
                src={charity.image_url || 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=1000'} 
                alt={charity.name} 
                className="h-full w-full object-cover transition-all duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent" />
            </div>

            <div className="flex-1 p-8 -mt-12 relative z-10">
              <h3 className="text-2xl font-serif font-bold text-[#F5F5DC] mb-1">{charity.name}</h3>
              <p className="text-xs text-[#8B837A] mb-8 line-clamp-1 italic">{charity.description}</p>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <p className="text-lg font-bold text-[#F5F5DC]">${raised.toLocaleString()}</p>
                   <span className="text-xs font-mono text-[#468A9A]">{progress}%</span>
                </div>
                <div className="w-full bg-[#0F0E0E] h-1.5 rounded-full overflow-hidden border border-[#2C2621]">
                  <div className="h-full bg-[#468A9A]" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <button 
                onClick={() => handleContribute(charity.id, raised)}
                disabled={isSupporting || processingId === charity.id || !isSubscriber}
                className={`w-full mt-8 py-4 rounded-xl border text-[10px] font-black uppercase tracking-[0.4em] transition-all
                  ${isSupporting 
                    ? 'border-[#468A9A]/30 text-[#468A9A] cursor-default' 
                    : !isSubscriber 
                      ? 'border-[#2C2621] text-[#5C544E] cursor-not-allowed bg-black/50' 
                      : processingId === charity.id
                        ? 'border-[#468A9A] text-[#F5F5DC] animate-pulse cursor-wait'
                        : 'border-[#2C2621] text-[#F5F5DC] hover:bg-[#468A9A] hover:text-[#0F0E0E]'}`}
              >
                {isSupporting ? 'SELECTED CAUSE' : !isSubscriber ? 'MEMBERS ONLY' : processingId === charity.id ? 'SYNCING...' : 'Contribute to Cause'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  )
}