"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface RealtimeLogoProps {
  collapsed?: boolean;
  className?: string;
}

export function RealtimeLogo({ collapsed = false, className = "" }: RealtimeLogoProps) {
  const supabase = createClient();
  const [brandSettings, setBrandSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("brand_settings")
        .select("*")
        .limit(1)
        .single();
      if (data) setBrandSettings(data);
    };

    fetchSettings();

    // Subscribe to realtime changes on brand_settings
    const channelId = `brand_settings_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "brand_settings" },
        (payload) => {
          if (payload.new) {
            setBrandSettings(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const logoUrl = brandSettings?.logo_url;
  const agencyName = brandSettings?.agency_display_name || "LMS Portal";

  const fullLogoUrl = logoUrl
    ? logoUrl.startsWith("http")
      ? logoUrl
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${logoUrl}`
    : null;

  if (collapsed) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {fullLogoUrl ? (
          <img src={fullLogoUrl} alt={agencyName} className="w-8 h-8 object-contain" />
        ) : (
          <span className="font-heading font-bold text-lg text-[#0f4ff1]">
            {agencyName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {fullLogoUrl ? (
        <img src={fullLogoUrl} alt={agencyName} className="h-7 w-auto object-contain" />
      ) : (
        <div className="w-8 h-8 rounded-lg bg-[#0f4ff1] flex items-center justify-center shrink-0">
           <span className="text-white font-bold text-sm">{agencyName.charAt(0).toUpperCase()}</span>
        </div>
      )}
      <span className="font-heading font-bold text-[17px] text-[#0f172a] truncate">
        {agencyName}
      </span>
    </div>
  );
}
