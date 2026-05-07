"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { BackButton } from "@/components/ui/BackButton";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, User2, Mail, ShieldCheck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function UserProfileSettingsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { success, error } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error: err } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", id)
        .single();
      
      if (err) {
        error("User not found");
        router.push("/admin/users");
      } else {
        setProfile(data);
      }
      setLoading(false);
    };
    fetchUser();
  }, [id]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const updates = {
      full_name: formData.get("fullName"),
      admin_notes: formData.get("notes"),
    };

    const { error: err } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", id);

    if (err) error(err.message);
    else success("Profile updated successfully");
    setSaving(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 size={32} className="animate-spin text-[#0f4ff1]" />
    </div>
  );

  return (
    <div className="w-full flex-1 max-w-2xl pb-10">
      <BackButton fallbackPath="/admin/users" />
      
      <div className="flex flex-col mb-8">
        <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] leading-tight">
          User Settings
        </h1>
        <p className="font-sans font-normal text-[15px] text-[#6b7280]">
          Manage profile information and internal administrative records.
        </p>
      </div>

      <div className="bg-white border border-[#e8edf5] rounded-[24px] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-[#f1f5f9] bg-[#f8fafc]/50">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-[#1e293b] text-white flex items-center justify-center font-heading font-bold text-[32px] overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url.startsWith("http") ? profile.avatar_url : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`} className="w-full h-full object-cover" />
                ) : profile.full_name.charAt(0)}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-heading font-bold text-[20px] text-[#0f172a]">{profile.full_name}</h3>
              <p className="text-[14px] text-[#6b7280] flex items-center gap-2 mt-1">
                <Mail size={14} /> {profile.email}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="px-2 py-0.5 bg-[#eff4fe] text-[#0f4ff1] rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck size={10} /> {profile.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-sans font-bold text-[13px] text-[#0f172a]">Full Name</label>
            <div className="relative">
              <User2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              <input 
                name="fullName" 
                defaultValue={profile.full_name} 
                className="w-full h-12 pl-12 pr-4 border border-[#e8edf5] rounded-xl outline-none focus:border-[#0f4ff1] font-sans text-[15px]"
                placeholder="Student's name"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-sans font-bold text-[13px] text-[#0f172a]">Email Address (Read Only)</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#cbd5e1]" />
              <input 
                disabled 
                defaultValue={profile.email} 
                className="w-full h-12 pl-12 pr-4 border border-[#e8edf5] rounded-xl bg-[#f8fafc] text-[#9ca3af] font-sans text-[15px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-sans font-bold text-[13px] text-[#0f172a]">Admin Notes</label>
            <textarea 
              name="notes" 
              defaultValue={profile.admin_notes} 
              className="w-full h-32 p-4 border border-[#e8edf5] rounded-xl outline-none focus:border-[#0f4ff1] font-sans text-[15px] resize-none"
              placeholder="Internal notes about this student..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="flex-1 h-12 rounded-xl font-bold text-[#64748b] hover:bg-[#f8fafc] transition-colors border border-[#e8edf5]"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="flex-1 h-12 bg-[#0f4ff1] text-white rounded-xl font-bold hover:bg-[#093094] transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
