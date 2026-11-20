"use client";

import React, { useCallback, useEffect, useState } from "react";
import { BackButton } from "@/components/ui/BackButton";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Loader2, Plus, RefreshCw, Users } from "lucide-react";

type Cohort = {
  id: string;
  name: string;
  start_date: string | null;
  created_at: string | null;
};

export default function AdminCohortsPage() {
  const { success, error } = useToast();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const fetchCohorts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/cohorts", {
        method: "GET",
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load cohorts.");
      setCohorts(result.cohorts || []);
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to load cohorts.");
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    void fetchCohorts();
  }, [fetchCohorts]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cohortName = name.trim();
    if (!cohortName) {
      error("Enter a cohort name.");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/admin/cohorts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cohortName }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to create cohort.");

      setCohorts((current) =>
        [...current, result.cohort].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setName("");
      success("Cohort created. It is now available in student assignment options.");
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to create cohort.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full flex-1 max-w-6xl pb-10">
      <BackButton fallbackPath="/admin" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] leading-tight">
            Cohort Management
          </h1>
          <p className="font-sans text-[15px] text-[#6b7280] mt-1">
            Create and view the cohorts used by this LMS when assigning students.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void fetchCohorts()}
          disabled={isLoading}
          className="h-[44px] px-4 flex items-center justify-center gap-2 border border-[#e8edf5] rounded-[12px] text-[#475569] hover:bg-[#f8fafc] disabled:opacity-50"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <section className="bg-white border border-[#e8edf5] rounded-[16px] p-5 md:p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-[12px] bg-[#eff4fe] text-[#0f4ff1] flex items-center justify-center">
            <Plus size={20} />
          </div>
          <div>
            <h2 className="font-heading font-bold text-[17px] text-[#0f172a]">Create a cohort</h2>
            <p className="text-[13px] text-[#64748b]">This adds a record to the LMS cohorts list only.</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            required
            placeholder="e.g. CSET Youth Nigeria 2027"
            aria-label="Cohort name"
            className="flex-1 h-[48px] px-4 border border-[#e2e8f0] rounded-[10px] text-[14px] outline-none focus:border-[#0f4ff1]"
          />
          <button
            type="submit"
            disabled={isCreating || !name.trim()}
            className="h-[48px] px-5 rounded-[10px] bg-[#0f4ff1] text-white font-heading font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-[#093094] disabled:opacity-50"
          >
            {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {isCreating ? "Creating..." : "Create Cohort"}
          </button>
        </form>
      </section>

      <section className="bg-white border border-[#e8edf5] rounded-[16px] overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-[#e8edf5] flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-[17px] text-[#0f172a]">Existing cohorts</h2>
            <p className="text-[13px] text-[#64748b] mt-0.5">
              {cohorts.length} {cohorts.length === 1 ? "cohort" : "cohorts"} in the LMS
            </p>
          </div>
          <Users size={20} className="text-[#94a3b8]" />
        </div>

        {isLoading ? (
          <div className="py-16 flex items-center justify-center gap-3 text-[#64748b] text-[14px]">
            <Loader2 size={20} className="animate-spin" />
            Loading cohorts...
          </div>
        ) : cohorts.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <Users size={36} className="mx-auto mb-3 text-[#cbd5e1]" />
            <p className="font-heading font-semibold text-[15px] text-[#0f172a]">No LMS cohorts yet</p>
            <p className="text-[13px] text-[#64748b] mt-1">
              Create a cohort above. It will then appear in the cohort assignment dropdown.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {cohorts.map((cohort) => (
              <div key={cohort.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-heading font-semibold text-[14px] text-[#0f172a] truncate">
                    {cohort.name}
                  </p>
                  <p className="text-[12px] text-[#94a3b8] mt-1">
                    Created {cohort.created_at ? new Date(cohort.created_at).toLocaleDateString() : "date unavailable"}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 text-[12px] text-[#64748b]">
                  <CalendarDays size={14} />
                  {cohort.start_date ? new Date(cohort.start_date).toLocaleDateString() : "No start date"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-[12px] text-[#94a3b8] mt-4">
        Cohorts created here are separate from the KreativHub website's cohort_dates records.
        No existing cohort, student assignment, enrolment, or learning record is changed by this page.
      </p>
    </div>
  );
}
