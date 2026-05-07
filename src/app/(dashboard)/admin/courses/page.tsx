"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { BackButton } from "@/components/ui/BackButton";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  BookOpen, 
  Users, 
  Trash2, 
  Pencil, 
  Search,
  Filter,
  Loader2,
  Clock,
  Layout
} from "lucide-react";
import Link from "next/link";

export default function AdminCoursesPage() {
  const { success, error } = useToast();
  const supabase = createClient();

  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      // Fetch courses and join with enrollment counts
      const { data, error: fetchError } = await supabase
        .from("courses")
        .select(`
          *,
          enrollments (count)
        `)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setCourses(data || []);
    } catch (err: any) {
      error("Failed to load courses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure? This will delete all modules and lessons for this course.")) return;

    try {
      const { error: err } = await supabase.from("courses").delete().eq("id", id);
      if (err) throw err;
      
      setCourses(prev => prev.filter(c => c.id !== id));
      success("Course deleted successfully");
    } catch (err: any) {
      error("Failed to delete course.");
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.course_group?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full flex-1 max-w-6xl pb-10">
      <BackButton fallbackPath="/admin" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-[32px]">
        <div>
          <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] leading-tight">Course Management</h1>
          <p className="font-sans font-normal text-[15px] text-[#6b7280]">
            Create, edit, and organize your curriculum.
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="bg-[#0f4ff1] text-white h-[48px] rounded-[12px] px-[24px] font-heading font-semibold text-[14px] hover:bg-[#093094] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
        >
          <Plus size={18} /> Add New Course
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#e8edf5] rounded-[16px] p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-[320px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input 
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[44px] pl-11 pr-4 bg-[#f9fafb] border border-[#e8edf5] rounded-[10px] text-[14px] outline-none focus:border-[#0f4ff1] transition-colors"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
           <button className="flex-1 md:flex-none h-[44px] px-4 border border-[#e8edf5] rounded-[10px] text-[14px] font-medium text-[#6b7280] flex items-center justify-center gap-2 hover:bg-[#f9fafb]">
             <Filter size={16} /> Filter
           </button>
           <button 
             onClick={fetchCourses}
             className="h-[44px] w-[44px] border border-[#e8edf5] rounded-[10px] flex items-center justify-center text-[#6b7280] hover:bg-[#f9fafb]"
           >
             <Loader2 size={16} className={isLoading ? "animate-spin" : ""} />
           </button>
        </div>
      </div>

      {/* Course List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={32} className="animate-spin text-[#0f4ff1]" />
          <p className="font-sans text-[14px] text-[#6b7280]">Loading your curriculum...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white border border-[#e8edf5] rounded-[16px] p-20 flex flex-col items-center text-center">
          <BookOpen size={48} className="text-[#e8edf5] mb-4" />
          <h3 className="font-heading font-bold text-[18px] text-[#0f172a]">No courses found</h3>
          <p className="font-sans text-[14px] text-[#6b7280] mt-1">Try adjusting your search or create a new course.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white border border-[#e8edf5] rounded-[20px] overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow group">
              <div className="h-[160px] bg-[#f8fafc] relative overflow-hidden">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#cbd5e1]">
                    <Layout size={40} />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#0f172a] uppercase tracking-wider shadow-sm border border-[#e8edf5]">
                    {course.course_group || "General"}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-[17px] text-[#0f172a] mb-2 line-clamp-2 min-h-[48px]">
                    {course.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-[13px] text-[#6b7280]">
                      <Users size={14} />
                      <span>{course.enrollments?.[0]?.count || 0} Students</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[13px] text-[#6b7280]">
                      <Clock size={14} />
                      <span>{course.total_videos || 0} Lessons</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-[#f1f5f9] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDeleteCourse(course.id)}
                      className="h-[36px] w-[36px] flex items-center justify-center rounded-[10px] text-[#ef4444] hover:bg-[#fef2f2] transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 size={16} />
                    </button>
                    <Link 
                      href={`/admin/courses/new?edit=${course.id}`}
                      className="h-[36px] w-[36px] flex items-center justify-center rounded-[10px] text-[#6b7280] hover:bg-[#f1f5f9] transition-colors"
                      title="Edit Course"
                    >
                      <Pencil size={16} />
                    </Link>
                  </div>
                  <Link 
                    href={`/admin/courses/new?edit=${course.id}`}
                    className="text-[13px] font-heading font-bold text-[#0f4ff1] hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
