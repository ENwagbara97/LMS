"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { UserCheck } from 'lucide-react';

export default function SetupPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === confirmPassword) {
      document.cookie = `user_role=student; path=/; max-age=3600`;
      window.location.href = '/student';
    } else {
      alert("Passwords do not match.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fdfefe] flex items-center justify-center p-4">
       <div className="w-full max-w-[420px] bg-white border border-[#e8edf5] rounded-[20px] shadow-[0_6px_20px_rgba(15,23,42,0.05)] p-[32px] animate-in slide-in-from-bottom flex flex-col items-center">
          
          <div className="w-[56px] h-[56px] bg-[#ecfdf5] rounded-[16px] flex items-center justify-center mb-6">
             <UserCheck className="text-[#16a34a]" size={28} />
          </div>
          
          <h1 className="font-heading font-extrabold text-[24px] text-[#0f172a] text-center leading-[1.3] mb-2">Setup Password</h1>
          <p className="font-sans font-normal text-[14px] text-[#6b7280] text-center mb-[32px] max-w-[280px]">Your account has been verified. Secure your workspace by creating a strong password.</p>
          
          <form className="flex flex-col gap-4 w-full" onSubmit={handleSetup}>
             <div className="flex flex-col gap-2">
               <label className="font-sans font-medium text-[13px] text-[#0f172a]">New Password</label>
               <input 
                 type="password" 
                 className="h-[44px] px-4 font-sans text-[14px] rounded-[12px] border border-[#e8edf5] focus:border-[#0f4ff1] focus:ring-1 focus:ring-[#0f4ff1] outline-none transition-all" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
               />
             </div>

             <div className="flex flex-col gap-2">
               <label className="font-sans font-medium text-[13px] text-[#0f172a]">Confirm Password</label>
               <input 
                 type="password" 
                 className="h-[44px] px-4 font-sans text-[14px] rounded-[12px] border border-[#e8edf5] focus:border-[#0f4ff1] focus:ring-1 focus:ring-[#0f4ff1] outline-none transition-all" 
                 value={confirmPassword}
                 onChange={(e) => setConfirmPassword(e.target.value)}
                 required
               />
             </div>

             <button 
               type="submit"
               className="h-[44px] bg-[#0f4ff1] hover:bg-[#093094] text-white font-heading font-semibold text-[14px] rounded-[12px] transition-colors mt-4"
             >
               Confirm & Login
             </button>
          </form>
       </div>
    </div>
  )
}
