"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2, Check, UploadCloud, Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";

export default function AdminSettingsPage() {
  const { error, success } = useToast();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<any>(null);
  const [agencyName, setAgencyName] = useState("");
  const [directorName, setDirectorName] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'Identity' | 'Mockups'>('Identity');

  // Mockup Assets State
  const [mockups, setMockups] = useState<any[]>([]);
  const [isUploadingMockup, setIsUploadingMockup] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Brand Settings
      const { data } = await supabase
        .from("brand_settings")
        .select("*")
        .limit(1)
        .single();
      
      if (data) {
        setSettings(data);
        setAgencyName(data.agency_display_name || "");
        setDirectorName(data.director_name || "");
        if (data.logo_url) {
          const url = data.logo_url.startsWith("http")
            ? data.logo_url
            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.logo_url}`;
          setLogoPreview(url);
        }
      }

      // 2. Mockup Assets
      const { data: mockupData } = await supabase
        .from("mockup_assets")
        .select("*")
        .order("created_at", { ascending: false });
      if (mockupData) setMockups(mockupData);
    };
    fetchData();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      error("File size must be less than 2MB");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars") // Reusing avatars bucket for logo
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Update brand_settings
      const { error: updateError } = await supabase
        .from("brand_settings")
        .upsert({ id: settings?.id, logo_url: fileName });

      if (updateError) throw updateError;

      success("Logo updated successfully");
    } catch (err: any) {
      error(`Upload failed: ${err.message || "Connection error"}`);
    }
  };

  const handleRemoveLogo = async () => {
    setLogoPreview(null);
    if (settings?.id) {
      await supabase.from("brand_settings").upsert({ id: settings.id, logo_url: null });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    success("Logo removed");
  };

  const handleAddMockup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMockup(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadErr } = await supabase.storage
        .from("mockups")
        .upload(fileName, file);
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from("mockups").getPublicUrl(fileName);

      const { data, error: insertErr } = await supabase
        .from("mockup_assets")
        .insert({
          title: file.name.split(".")[0],
          image_url: publicUrl,
          category: "Web"
        })
        .select()
        .single();
      
      if (insertErr) throw insertErr;
      setMockups([data, ...mockups]);
      success("Mockup added");
    } catch (err: any) {
      error(`Failed: ${err.message}`);
    } finally {
      setIsUploadingMockup(false);
    }
  };

  const handleDeleteMockup = async (id: string) => {
    const { error: err } = await supabase.from("mockup_assets").delete().eq("id", id);
    if (!err) {
      setMockups(mockups.filter(m => m.id !== id));
      success("Mockup removed");
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const { error: err } = await supabase
        .from("brand_settings")
        .upsert({ 
          id: settings?.id,
          agency_display_name: agencyName,
          director_name: directorName,
          updated_at: new Date().toISOString()
        });
      if (err) throw err;
      setSaved(true);
      success("Settings updated");
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      error(`Failed to save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full flex-1 max-w-3xl pb-10">
      <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] mb-[32px] leading-tight">Platform Settings</h1>

      <div className="flex items-center gap-8 border-b border-[#e8edf5] mb-8">
        <button 
          onClick={() => setActiveTab('Identity')}
          className={`pb-4 font-heading font-bold text-[15px] relative transition-colors ${activeTab === 'Identity' ? "text-[#0f4ff1]" : "text-[#6b7280] hover:text-[#0f172a]"}`}
        >
          Brand Identity
          {activeTab === 'Identity' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f4ff1]" />}
        </button>
        <button 
          onClick={() => setActiveTab('Mockups')}
          className={`pb-4 font-heading font-bold text-[15px] relative transition-colors ${activeTab === 'Mockups' ? "text-[#0f4ff1]" : "text-[#6b7280] hover:text-[#0f172a]"}`}
        >
          Mockup Assets
          {activeTab === 'Mockups' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f4ff1]" />}
        </button>
      </div>

      <div className="flex flex-col gap-[24px]">
        {activeTab === 'Identity' && (
          <div className="bg-white border border-[#e8edf5] rounded-[16px] p-[24px] animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}>
            <h2 className="font-heading font-bold text-[18px] text-[#0f172a] mb-[20px]">Identity Configuration</h2>

          <div className="flex items-center gap-[20px] mb-[24px]">
            {logoPreview ? (
              <div className="relative group shrink-0">
                <img
                  src={logoPreview}
                  alt="Agency Logo"
                  className="w-[80px] h-[80px] rounded-lg object-contain border border-[#e8edf5] bg-[#f9fafb]"
                />
                <button
                  onClick={handleRemoveLogo}
                  className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} className="text-white" />
                </button>
              </div>
            ) : (
              <div className="w-[80px] h-[80px] shrink-0 rounded-lg bg-[#f1f5f9] border border-dashed border-[#cbd5e1] text-[#9ca3af] flex items-center justify-center font-heading">
                Logo
              </div>
            )}
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="font-heading font-semibold text-[14px] text-[#0f4ff1] hover:underline bg-transparent"
              >
                Upload Agency Logo
              </button>
              <p className="font-sans text-[12px] text-[#9ca3af] mt-1">PNG or JPEG, max 2MB. Recommends transparent bg.</p>
              <input
                type="file"
                className="hidden"
                accept="image/png, image/jpeg"
                ref={fileInputRef}
                onChange={handleLogoUpload}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] mb-[24px]">
            <div className="flex flex-col gap-[8px]">
              <label className="font-sans font-medium text-[13px] text-[#6b7280]">Agency Display Name</label>
              <input
                type="text"
                placeholder="e.g. Kreativhub"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="h-[48px] border border-[#e8edf5] rounded-[10px] px-[16px] font-sans font-normal text-[15px] text-[#0f172a] focus:outline-none focus:border-[#0f4ff1] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-[8px]">
              <label className="font-sans font-medium text-[13px] text-[#6b7280]">Director Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                className="h-[48px] border border-[#e8edf5] rounded-[10px] px-[16px] font-sans font-normal text-[15px] text-[#0f172a] focus:outline-none focus:border-[#0f4ff1] transition-colors"
              />
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-[#0f4ff1] text-white font-heading font-semibold text-[14px] h-[44px] px-[24px] rounded-[12px] hover:bg-[#093094] transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {isSaving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : saved ? (
              <><Check size={16} /> Saved!</>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
        )}

        {activeTab === 'Mockups' && (
          <div className="bg-white border border-[#e8edf5] rounded-[16px] p-[24px] animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-heading font-bold text-[18px] text-[#0f172a]">Portfolio Mockups</h2>
                  <p className="font-sans text-[13px] text-[#6b7280]">Manage images used for student portfolio inspiration.</p>
                </div>
                <label className="bg-[#0f4ff1] text-white px-4 h-[40px] rounded-[10px] font-heading font-semibold text-[13px] hover:bg-[#093094] transition-colors flex items-center gap-2 cursor-pointer">
                   {isUploadingMockup ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : <><Plus size={16} /> Add Mockup</>}
                   <input type="file" className="hidden" accept="image/*" onChange={handleAddMockup} disabled={isUploadingMockup} />
                </label>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mockups.map((m) => (
                  <div key={m.id} className="group relative aspect-video bg-[#f8fafc] border border-[#e8edf5] rounded-xl overflow-hidden">
                    <img src={m.image_url} alt={m.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       <button onClick={() => handleDeleteMockup(m.id)} className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-lg backdrop-blur-sm">
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                ))}
                {mockups.length === 0 && (
                  <div className="col-span-3 py-10 border border-dashed border-[#cbd5e1] rounded-xl flex flex-col items-center justify-center text-[#9ca3af]">
                    <ImageIcon size={32} className="mb-2" />
                    <p className="font-sans text-[13px]">No mockup assets found.</p>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
