"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [toggles, setToggles] = useState([true, true, false, true]);

  const handleToggle = (idx: number) => {
    const newT = [...toggles];
    newT[idx] = !newT[idx];
    setToggles(newT);
  };

  return (
    <div className="w-full flex-1 max-w-3xl pb-10">
      <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] mb-[32px] leading-tight">Settings</h1>

      <div className="flex flex-col gap-[24px]">
        
        {/* Profile Card */}
        <div className="bg-white border border-[#e8edf5] rounded-[16px] p-[24px]" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}>
          <h2 className="font-heading font-bold text-[18px] text-[#0f172a] mb-[20px]">Profile Information</h2>
          
          <div className="flex items-center gap-[20px] mb-[24px]">
             <div className="w-[64px] h-[64px] rounded-full bg-[#1e293b] text-white flex items-center justify-center font-heading font-bold text-[24px]">JS</div>
             <button className="font-heading font-semibold text-[14px] text-[#0f4ff1] hover:underline bg-transparent">Change photo</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] mb-[24px]">
            <div className="flex flex-col gap-[8px]">
              <label className="font-sans font-medium text-[13px] text-[#6b7280]">Full Name</label>
              <input type="text" defaultValue="Jane Student" className="h-[48px] border border-[#e8edf5] rounded-[10px] px-[16px] font-sans font-normal text-[15px] text-[#0f172a] focus:outline-none focus:border-[#0f4ff1]" />
            </div>
            <div className="flex flex-col gap-[8px]">
              <label className="font-sans font-medium text-[13px] text-[#6b7280]">Email Address</label>
              <input type="text" readOnly defaultValue="jane@student.com" className="h-[48px] bg-[#f1f5f9] border border-[#e8edf5] rounded-[10px] px-[16px] font-sans font-normal text-[15px] text-[#9ca3af] focus:outline-none cursor-not-allowed" />
            </div>
          </div>
          <button className="bg-[#0f4ff1] text-white font-heading font-semibold text-[14px] h-[44px] px-[24px] rounded-[12px] hover:bg-[#093094] transition-colors">
             Save changes
          </button>
        </div>

        {/* Security / Password Card */}
        <div className="bg-white border border-[#e8edf5] rounded-[16px] p-[24px]" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}>
          <h2 className="font-heading font-bold text-[18px] text-[#0f172a] mb-[20px]">Security</h2>
          <div className="grid grid-cols-1 gap-[16px] mb-[24px] max-w-md">
            <div className="flex flex-col gap-[8px]">
              <label className="font-sans font-medium text-[13px] text-[#6b7280]">Current Password</label>
              <input type="password" placeholder="••••••••" className="h-[48px] border border-[#e8edf5] rounded-[10px] px-[16px] focus:outline-none focus:border-[#0f4ff1]" />
            </div>
            <div className="flex flex-col gap-[8px]">
              <label className="font-sans font-medium text-[13px] text-[#6b7280]">New Password</label>
              <input type="password" placeholder="••••••••" className="h-[48px] border border-[#e8edf5] rounded-[10px] px-[16px] focus:outline-none focus:border-[#0f4ff1]" />
            </div>
          </div>
          <button className="bg-white text-[#0f172a] border border-[#e8edf5] font-heading font-semibold text-[14px] h-[44px] px-[24px] rounded-[12px] hover:bg-[#f9fafb] transition-colors" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
             Update password
          </button>
        </div>

        {/* Notification Prefs */}
        <div className="bg-white border border-[#e8edf5] rounded-[16px] p-[24px]" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}>
          <h2 className="font-heading font-bold text-[18px] text-[#0f172a] mb-[20px]">Notification Preferences</h2>
          <div className="flex flex-col">
            {[
              "Email on quiz result",
              "Email on project feedback",
              "Email on certificate issued",
              "Weekly progress reminder"
            ].map((label, i) => (
               <div key={i} className="flex items-center justify-between py-[16px] border-b border-[#f1f5f9] last:border-0 last:pb-0">
                 <span className="font-sans font-normal text-[15px] text-[#0f172a]">{label}</span>
                 
                 {/* Custom Toggle CSS */}
                 <div onClick={() => handleToggle(i)} className={`w-[40px] h-[22px] rounded-full flex items-center px-[2px] cursor-pointer transition-colors ${toggles[i] ? "bg-[#0f4ff1]" : "bg-[#e5e7eb]"}`}>
                    <div className={`w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform ${toggles[i] ? "translate-x-[18px]" : ""}`}></div>
                 </div>
               </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
