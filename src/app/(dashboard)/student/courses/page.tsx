"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Search, Image as ImageIcon, ArrowRight, Loader2, Filter, X, BookOpen } from "lucide-react";
import Link from "next/link";

export default function CoursesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);

  const loadCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Fetch only ENROLLED courses for this student — deduplicated by course_id
      const { data: enrollments, error } = await supabase
        .from("enrollments")
        .select(`
          id,
          course_id,
          status,
          courses (
            id, title, description, thumbnail_url, difficulty,
            course_group, total_videos, total_duration_minutes, category_tag
          )
        `)
        .eq("student_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // FIX 6A — Deduplicate by course_id (keep first occurrence)
      const seen = new Set<string>();
      const uniqueCourses = (enrollments ?? [])
        .filter((e) => {
          const courseId = e.course_id ?? (e.courses as any)?.id;
          if (!courseId || seen.has(courseId)) return false;
          seen.add(courseId);
          return true;
        })
        .map((e) => e.courses)
        .filter(Boolean) as any[];

      setCourses(uniqueCourses);

      const uniqueCats = Array.from(
        new Set(uniqueCourses.map((c: any) => c.course_group || c.category_tag).filter(Boolean))
      );
      setCategories(["All", ...uniqueCats as string[]]);
    } catch (err: any) {
      console.error("Failed to load courses:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCourses(); }, []);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const courseCategory = c.course_group || c.category_tag;
    const matchesCategory = selectedCategory === "All" || courseCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-[#0f4ff1] mb-4" size={32} />
      <p className="font-sans text-[#6b7280]">Loading your enrolled courses...</p>
    </div>
  );

  return (
    <div className="w-full flex-1 pb-20">
      <div className="mb-[32px] flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1">
          <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] leading-tight">My Courses</h1>
          {/* FIX 6D — Updated subheading */}
          <p className="font-sans font-normal text-[15px] text-[#6b7280] mt-[4px]">
            Explore your enrolled curriculum and pick up where you left off.
          </p>
        </div>

        <div className="relative w-full md:w-[320px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[48px] pl-12 pr-4 bg-white border border-[#e8edf5] rounded-xl font-sans text-[14px] text-[#0f172a] focus:outline-none focus:border-[#0f4ff1] focus:ring-4 focus:ring-[#0f4ff1]/5 transition-all shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#0f172a]">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 shrink-0 mr-2 px-3 py-1.5 bg-[#f8fafc] rounded-lg border border-[#f1f5f9]">
          <Filter size={14} className="text-[#6b7280]" />
          <span className="font-sans font-bold text-[11px] text-[#6b7280] uppercase tracking-wider">Filter</span>
        </div>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full font-heading font-semibold text-[13px] whitespace-nowrap border transition-all ${
              selectedCategory === cat
                ? "bg-[#0f4ff1] border-[#0f4ff1] text-white shadow-md shadow-blue-200"
                : "bg-white border-[#e8edf5] text-[#6b7280] hover:border-[#0f4ff1]/30"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] w-full">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-[100px] border border-dashed border-[#e8edf5] rounded-[24px] bg-white">
            <div className="w-[64px] h-[64px] rounded-full bg-[#f8fafc] flex items-center justify-center mb-6 text-[#cbd5e1]">
              <BookOpen size={32} />
            </div>
            <h3 className="font-heading font-bold text-[20px] text-[#0f172a] mb-2">
              {courses.length === 0 ? "No enrolled courses" : "No matches found"}
            </h3>
            <p className="font-sans text-[15px] text-[#6b7280] max-w-sm text-center">
              {courses.length === 0
                ? "You have not been enrolled in any courses yet. Contact your instructor."
                : "Try adjusting your filters or search keywords."}
            </p>
            {courses.length > 0 && (
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                className="mt-6 font-heading font-bold text-[14px] text-[#0f4ff1] hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          filteredCourses.map((c: any) => {
            let badgeStyles = "bg-[#f0fdf4] text-[#16a34a]";
            if (c.difficulty === "Intermediate") badgeStyles = "bg-[#fffbeb] text-[#d97706]";
            else if (c.difficulty === "Advanced") badgeStyles = "bg-[#fef2f2] text-[#dc2626]";

            return (
              <div
                key={c.id}
                className="bg-white border border-[#e8edf5] rounded-[20px] overflow-hidden flex flex-col cursor-pointer transition-all duration-300 ease group hover:-translate-y-2 shadow-sm hover:shadow-xl"
              >
                {/* Thumbnail Section */}
                <div className="w-full h-[180px] bg-gradient-to-br from-[#eff4fe] to-[#dbeafe] flex flex-col items-center justify-center shrink-0 relative overflow-hidden">
                  {c.thumbnail_url ? (
                    <img src={c.thumbnail_url} alt={c.title} className="w-full h-full object-cover absolute inset-0" />
                  ) : (
                    <>
                      <ImageIcon size={40} className="text-[#93c5fd] opacity-40 mb-2 group-hover:scale-110 transition-transform duration-500" />
                      <span className="font-sans font-bold text-[10px] text-[#93c5fd] uppercase tracking-widest opacity-60">Module Preview</span>
                    </>
                  )}
                  <div className="absolute top-0 right-0 p-4">
                    {c.difficulty && (
                      <div className={`px-2.5 py-0.5 rounded-full font-sans font-bold text-[10px] uppercase tracking-wider ${badgeStyles}`}>
                        {c.difficulty}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-[24px] pt-[20px] pb-[24px] flex flex-col flex-1 border-t border-[#f1f5f9]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-[#eff4fe] text-[#0f4ff1] font-sans font-bold text-[10px] uppercase tracking-wider h-[22px] rounded-md px-[8px] flex items-center">
                      {c.course_group || c.category_tag || "General"}
                    </div>
                    {(c.total_videos || 0) > 0 && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-[#cbd5e1]" />
                        <span className="font-sans font-bold text-[11px] text-[#9ca3af] uppercase tracking-tight">
                          {c.total_videos} Videos
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="font-heading font-extrabold text-[19px] text-[#0f172a] mb-2 leading-tight group-hover:text-[#0f4ff1] transition-colors">
                    {c.title}
                  </h3>
                  <p className="font-sans text-[14px] text-[#6b7280] leading-[1.6] line-clamp-2">{c.description}</p>

                  <div className="w-full border-t border-[#f1f5f9] my-5" />

                  <Link
                    href={`/student/courses/${c.id}`}
                    className="mt-auto h-[48px] w-full bg-[#f8fafc] border border-[#e8edf5] rounded-xl font-heading font-bold text-[14px] text-[#0f172a] flex items-center justify-center gap-2 group-hover:bg-[#0f4ff1] group-hover:text-white group-hover:border-[#0f4ff1] transition-all"
                  >
                    Continue Learning
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
