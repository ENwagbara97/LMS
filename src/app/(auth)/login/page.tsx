"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error: toastError } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'unauthorized') {
      toastError("No account found for this email. Contact your instructor.");
    }
  }, [toastError]);

  const handleLogin = (e: React.FormEvent, role: 'student' | 'admin') => {
    e.preventDefault();
    document.cookie = `user_role=${role}; path=/; max-age=3600`;
    if (role === 'admin') {
       window.location.href = '/admin';
    } else {
       window.location.href = '/student';
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toastError("Please enter your email first.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) {
      toastError(error.message);
    } else {
      success("Check your email for a reset link.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fdfefe] flex items-center justify-center p-4">
       <div className="w-full max-w-[420px] bg-white border border-[#e8edf5] rounded-[20px] shadow-[0_6px_20px_rgba(15,23,42,0.05)] p-[32px] animate-in fade-in zoom-in duration-300">
          
          <div className="flex justify-center mb-[24px]">
            <div className="w-[56px] h-[56px] bg-[#eff4fe] rounded-[16px] flex items-center justify-center">
              <Sparkles className="text-[#0f4ff1]" size={28} />
            </div>
          </div>
          
          <h1 className="font-heading font-extrabold text-[24px] text-[#0f172a] text-center leading-[1.3] mb-2">Welcome Back</h1>
          <p className="font-sans font-normal text-[14px] text-[#6b7280] text-center mb-[32px]">Enter your credentials to access your portal.</p>
          
          <div className="flex flex-col gap-4 mb-6">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-[44px] bg-white border border-[#e8edf5] hover:bg-[#f8fafc] text-[#0f172a] font-sans font-semibold text-[14px] rounded-[12px] transition-colors flex items-center justify-center gap-3 shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706s.102-1.166.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.443 2.048.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-[#f1f5f9]"></div>
              <span className="font-sans text-[12px] text-[#9ca3af] uppercase tracking-wider">or</span>
              <div className="flex-1 h-[1px] bg-[#f1f5f9]"></div>
            </div>
          </div>
          
          <form className="flex flex-col gap-5">
             <div className="flex flex-col gap-2">
               <label className="font-sans font-medium text-[13px] text-[#0f172a]">Email Address</label>
               <input 
                 type="email" 
                 className="h-[44px] px-4 font-sans text-[14px] rounded-[12px] border border-[#e8edf5] focus:border-[#0f4ff1] focus:ring-1 focus:ring-[#0f4ff1] outline-none transition-all placeholder:text-[#cbd5e1]" 
                 placeholder="name@organization.com"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
               />
             </div>

             <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="font-sans font-medium text-[13px] text-[#0f172a]">Password</label>
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="font-sans font-medium text-[12px] text-[#0f4ff1] hover:underline disabled:opacity-50"
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </div>
               <div className="relative">
                 <input 
                   type={showPassword ? "text" : "password"} 
                   className="w-full h-[44px] pl-4 pr-10 font-sans text-[14px] rounded-[12px] border border-[#e8edf5] focus:border-[#0f4ff1] focus:ring-1 focus:ring-[#0f4ff1] outline-none transition-all placeholder:text-[#cbd5e1]" 
                   placeholder="••••••••"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                 />
                 <button 
                   type="button" 
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-3 top-[12px] text-[#9ca3af] hover:text-[#4b5563] focus:outline-none"
                 >
                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                 </button>
               </div>
             </div>

             <div className="mt-2 flex gap-3">
               <button 
                 type="button"
                 onClick={(e) => handleLogin(e, 'student')} 
                 className="flex-1 h-[44px] bg-[#0f4ff1] hover:bg-[#093094] text-white font-heading font-semibold text-[14px] rounded-[12px] transition-colors"
               >
                 Log in as Student
               </button>
               <button 
                 type="button"
                 onClick={(e) => handleLogin(e, 'admin')} 
                 className="flex-1 h-[44px] bg-white border border-[#0f4ff1] text-[#0f4ff1] hover:bg-[#eff4fe] font-heading font-semibold text-[14px] rounded-[12px] transition-colors"
               >
                 Log in as Admin
               </button>
             </div>
          </form>

          <p className="mt-8 text-center font-sans text-[13px] text-[#6b7280]">
            Don't have an account? <Link href="/setup-password" className="text-[#0f4ff1] font-semibold hover:underline">Complete Setup</Link>
          </p>

       </div>
    </div>
  )
}
