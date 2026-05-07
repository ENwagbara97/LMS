"use client";

import React, { useState, useRef, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { BackButton } from "@/components/ui/BackButton";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Loader2, Check, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  const { error, success } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [preferences, setPreferences] = useState({
    quiz_results: true,
    feedback: true,
    certificates: true,
    reminders: true,
    sound_effects: true
  });

  // ─── Load Profile on Mount ──────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        if (data.avatar_url) {
          const url = data.avatar_url.startsWith("http")
            ? data.avatar_url
            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.avatar_url}`;
          setAvatarPreview(url);
        }
        if (data.preferences_json) {
          setPreferences({
            ...preferences,
            ...data.preferences_json
          });
        }
      }
    };
    load();
  }, []);

  // ─── Avatar Upload ──────────────────────────────────────────────────────────
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (file.size > 2 * 1024 * 1024) {
      error("File size must be less than 2MB");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: fileName })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      success("Photo updated successfully");
    } catch (err: any) {
      error(`Upload failed: ${err.message || "Connection error"}`);
    }
  };

  const handleRemovePhoto = async () => {
    if (!userId) return;
    setAvatarPreview(null);
    await supabase.from("profiles").update({ avatar_url: null }).eq("user_id", userId);
    if (fileInputRef.current) fileInputRef.current.value = "";
    success("Photo removed");
  };

  // ─── Save Profile (Full Name) ───────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!userId) return;
    setIsSavingProfile(true);
    try {
      // Use upsert to create the profile if it doesn't exist
      const { error: err } = await supabase
        .from("profiles")
        .upsert({ 
          user_id: userId, 
          full_name: fullName,
          email: profile?.email || (await supabase.auth.getUser()).data.user?.email
        });
      if (err) throw err;
      setProfileSaved(true);
      success("Profile updated");
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err: any) {
      error(`Failed to save: ${err.message}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ─── Change Password ────────────────────────────────────────────────────────
  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      error("New password must be at least 8 characters");
      return;
    }
    setIsSavingPassword(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password: newPassword });
      if (err) throw err;
      success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      error(`Password update failed: ${err.message}`);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handlePreferenceChange = async (key: string, val: boolean) => {
    const newPrefs = { ...preferences, [key]: val };
    setPreferences(newPrefs);
    
    if (userId) {
      const { error: err } = await supabase
        .from("profiles")
        .update({ preferences_json: newPrefs })
        .eq("user_id", userId);
      
      if (err) error("Failed to update preference");
    }
  };

  return (
    <div className="w-full flex-1 max-w-3xl pb-10">
      <BackButton fallbackPath="/student" />
      <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] mb-[32px] leading-tight">Settings</h1>

      <div className="flex flex-col gap-[24px]">

        {/* ── Profile Card ─────────────────────────────────────────────────── */}
        <div className="bg-white border border-[#e8edf5] rounded-[16px] p-[24px]" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}>
          <h2 className="font-heading font-bold text-[18px] text-[#0f172a] mb-[20px]">Profile Information</h2>

          <div className="flex items-center gap-[20px] mb-[24px]">
            {avatarPreview ? (
              <div className="relative group shrink-0">
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-[64px] h-[64px] rounded-full object-cover"
                />
                <button
                  onClick={handleRemovePhoto}
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} className="text-white" />
                </button>
              </div>
            ) : (
              <div className="w-[40px] h-[40px] md:w-[64px] md:h-[64px] shrink-0 rounded-full bg-[#1e293b] text-white flex items-center justify-center font-heading font-bold text-[18px] md:text-[24px]">
                {fullName ? fullName.charAt(0).toUpperCase() : "?"}
              </div>
            )}
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="font-heading font-semibold text-[14px] text-[#0f4ff1] hover:underline bg-transparent"
              >
                Change photo
              </button>
              <p className="font-sans text-[12px] text-[#9ca3af] mt-1">PNG or JPEG, max 2MB</p>
              <input
                type="file"
                className="hidden"
                accept="image/png, image/jpeg"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] mb-[24px]">
            <div className="flex flex-col gap-[8px]">
              <label className="font-sans font-medium text-[13px] text-[#6b7280]">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-[48px] border border-[#e8edf5] rounded-[10px] px-[16px] font-sans font-normal text-[15px] text-[#0f172a] focus:outline-none focus:border-[#0f4ff1] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-[8px]">
              <label className="font-sans font-medium text-[13px] text-[#6b7280]">Email Address</label>
              <input
                type="text"
                readOnly
                value={profile?.email || ""}
                className="h-[48px] bg-[#f1f5f9] border border-[#e8edf5] rounded-[10px] px-[16px] font-sans font-normal text-[15px] text-[#9ca3af] focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="bg-[#0f4ff1] text-white font-heading font-semibold text-[14px] h-[44px] px-[24px] rounded-[12px] hover:bg-[#093094] transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {isSavingProfile ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : profileSaved ? (
              <><Check size={16} /> Saved!</>
            ) : (
              "Save changes"
            )}
          </button>
        </div>

        {/* ── Security / Password Card ──────────────────────────────────────── */}
        <div className="bg-white border border-[#e8edf5] rounded-[16px] p-[24px]" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}>
          <h2 className="font-heading font-bold text-[18px] text-[#0f172a] mb-[20px]">Security</h2>
          <div className="grid grid-cols-1 gap-[16px] mb-[24px] max-w-md">
            <div className="flex flex-col gap-[8px]">
              <label className="font-sans font-medium text-[13px] text-[#6b7280]">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full h-[48px] border border-[#e8edf5] rounded-[10px] px-[16px] pr-[44px] focus:outline-none focus:border-[#0f4ff1] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-[8px]">
              <label className="font-sans font-medium text-[13px] text-[#6b7280]">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-[48px] border border-[#e8edf5] rounded-[10px] px-[16px] pr-[44px] focus:outline-none focus:border-[#0f4ff1] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={handleUpdatePassword}
            disabled={isSavingPassword}
            className="bg-white text-[#0f172a] border border-[#e8edf5] font-heading font-semibold text-[14px] h-[44px] px-[24px] rounded-[12px] hover:bg-[#f9fafb] transition-colors disabled:opacity-70 flex items-center gap-2"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
          >
            {isSavingPassword ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : "Update password"}
          </button>
        </div>

        {/* ── Notification & Sound Prefs ─────────────────────────────────────── */}
        <div className="bg-white border border-[#e8edf5] rounded-[16px] p-[24px]" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}>
          <h2 className="font-heading font-bold text-[18px] text-[#0f172a] mb-[20px]">App Preferences</h2>
          <div className="flex flex-col">
            {[
              { id: 'quiz_results', label: "Email on quiz result" },
              { id: 'feedback', label: "Email on project feedback" },
              { id: 'certificates', label: "Email on certificate issued" },
              { id: 'reminders', label: "Weekly progress reminder" },
              { id: 'sound_effects', label: "Interface Sound Effects" },
            ].map((pref) => (
              <div key={pref.id} className="flex items-center justify-between py-[16px] border-b border-[#f1f5f9] last:border-0 last:pb-0">
                <span className="font-sans font-normal text-[15px] text-[#0f172a]">{pref.label}</span>
                <div
                  onClick={() => handlePreferenceChange(pref.id, !preferences[pref.id as keyof typeof preferences])}
                  className={`w-[40px] h-[22px] rounded-full flex items-center px-[2px] cursor-pointer transition-colors ${preferences[pref.id as keyof typeof preferences] ? "bg-[#0f4ff1]" : "bg-[#e5e7eb]"}`}
                >
                  <div className={`w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform ${preferences[pref.id as keyof typeof preferences] ? "translate-x-[18px]" : ""}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
