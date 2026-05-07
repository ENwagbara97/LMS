"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { BackButton } from "@/components/ui/BackButton";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { 
  Plus, 
  RefreshCw, 
  Loader2, 
  Users, 
  Trash2, 
  X, 
  ChevronDown,
  GripVertical,
  Video,
  Pencil
} from "lucide-react";

export default function AdminUsersPage() {
  const { success, error } = useToast();
  const supabase = createClient();

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserProgress, setSelectedUserProgress] = useState<any[]>([]);
  const [adminNotes, setAdminNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showSavedNotes, setShowSavedNotes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cohorts, setCohorts] = useState<any[]>([]);

  const [courseGroups, setCourseGroups] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState("Beginner");

  // ─── Fetch profiles from DB ─────────────────────────────────────────────────
  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      error("Failed to load users.");
    } else {
      setUsers(data || []);
    }
    setIsLoading(false);
  };

  const fetchCohorts = async () => {
    const { data } = await supabase.from("cohorts").select("*").order("name");
    if (data) setCohorts(data);
  };

  const fetchCourseGroups = async () => {
    const { data } = await supabase.from("courses").select("course_group");
    if (data) {
      const groups = Array.from(new Set(data.map(d => d.course_group))).filter(Boolean) as string[];
      setCourseGroups(groups);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCohorts();
    fetchCourseGroups();
  }, []);

  // ─── Add User ───────────────────────────────────────────────────────────────
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;
    const learning_path = formData.get("learning_path") as string;

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          role, 
          learning_path,
          assigned_course_groups: selectedGroups,
          assigned_level: selectedLevel
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to create user");

      success("User invited and profile created.");
      setIsAddOpen(false);
      setSelectedGroups([]);
      setSelectedLevel("Beginner");
      (e.target as HTMLFormElement).reset();
      await fetchUsers();
    } catch (err: any) {
      error(err.message || "Failed to add user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Delete User ────────────────────────────────────────────────────────────
  const handleDeleteUser = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this user?")) return;

    // Delete via the admin API
    try {
      const res = await fetch(`/api/admin/users?user_id=${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
      if (selectedUser?.user_id === userId) setSelectedUser(null);
      success("User deleted.");
    } catch (err: any) {
      error("Failed to delete user.");
    }
  };

  // ─── Open drawer: load admin_notes & progress from selected user ───────────
  const handleSelectUser = async (u: any) => {
    setSelectedUser(u);
    setAdminNotes(u.admin_notes || "");
    
    // Fetch real progress
    const { data: prog } = await supabase
      .from('lesson_progress')
      .select('*, lessons(title)')
      .eq('student_id', u.user_id);
    setSelectedUserProgress(prog || []);

    // Fetch active enrollment for the ring (FIX 10E)
    const { data: enroll } = await supabase
      .from('enrollments')
      .select('*, courses(title)')
      .eq('student_id', u.user_id)
      .eq('status', 'active')
      .maybeSingle();
    
    // We can store this in selectedUser or a new state. Let's just add it to selectedUser for simplicity
    setSelectedUser(prev => ({ ...prev, activeEnrollment: enroll }));
  };

  // ─── Auto-save admin_notes ────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedUser) return;
    if (adminNotes === (selectedUser.admin_notes || "")) return;

    const timer = setTimeout(async () => {
      setIsSavingNotes(true);
      const { error: err } = await supabase
        .from("profiles")
        .update({ admin_notes: adminNotes })
        .eq("user_id", selectedUser.user_id);

      if (!err) {
        setShowSavedNotes(true);
        setTimeout(() => setShowSavedNotes(false), 2000);
        // Update local users list
        setUsers(prev => prev.map(user => 
          user.user_id === selectedUser.user_id ? { ...user, admin_notes: adminNotes } : user
        ));
      }
      setIsSavingNotes(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [adminNotes]);

  const toggleGroup = (group: string) => {
    setSelectedGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]);
  };

  return (
    <div className="w-full flex-1 max-w-6xl pb-10 relative">
      <BackButton fallbackPath="/admin" />
      <div className="flex items-center justify-between mb-[32px]">
        <div>
          <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] leading-tight">Manage Users</h1>
          <p className="font-sans font-normal text-[15px] text-[#6b7280]">
            Add, remove, or change permission roles across the platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            className="h-[44px] w-[44px] flex items-center justify-center border border-[#e8edf5] rounded-[12px] text-[#6b7280] hover:bg-[#f9fafb] transition-colors"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-[#0f4ff1] text-white h-[44px] rounded-[12px] px-[20px] font-heading font-semibold text-[14px] hover:bg-[#093094] transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#e8edf5] rounded-[16px] overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.05)] w-full">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-[#9ca3af]">
            <Loader2 size={24} className="animate-spin mr-3" />
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Users size={40} className="text-[#e8edf5] mb-4" />
            <p className="font-heading font-semibold text-[16px] text-[#0f172a]">No users yet</p>
            <p className="font-sans text-[14px] text-[#6b7280]">Click "Add User" to invite your first student.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans min-w-[700px]">
              <thead>
                <tr className="bg-[#f9fafb] border-b border-[#e8edf5] text-[11px] md:text-[12px] uppercase text-[#6b7280] font-semibold tracking-wider">
                  <th className="px-4 md:px-6 py-4">Name</th>
                  <th className="px-4 md:px-6 py-4">Role</th>
                  <th className="px-6 py-4 hidden md:table-cell">Joined</th>
                  <th className="px-6 py-4 hidden lg:table-cell">Status</th>
                  <th className="px-4 md:px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.user_id}
                    className="border-b border-[#f1f5f9] last:border-0 hover:bg-[#fdfefe] transition-colors cursor-pointer"
                    onClick={() => handleSelectUser(u)}
                  >
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-[32px] h-[32px] md:w-[36px] md:h-[36px] rounded-full bg-[#1e293b] text-white flex items-center justify-center font-heading font-bold text-[12px] md:text-[14px] shrink-0 overflow-hidden">
                          {u.avatar_url ? (
                            <img
                              src={u.avatar_url.startsWith("http") ? u.avatar_url : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${u.avatar_url}`}
                              alt={u.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            (u.full_name || "?").charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-heading font-semibold text-[13px] md:text-[14px] text-[#0f172a] truncate">{u.full_name}</span>
                          <span className="text-[11px] md:text-[13px] text-[#6b7280] truncate">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[10px] md:text-[11px] font-semibold ${u.role === "admin" ? "bg-[#eff4fe] text-[#0f4ff1]" : "bg-[#f1f5f9] text-[#6b7280]"}`}>
                        {u.role === "admin" ? "Admin" : "Student"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#4b5563] hidden md:table-cell">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#16a34a]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                        Active
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 flex justify-end gap-2">
                      <button
                        onClick={(e) => handleDeleteUser(u.user_id, e)}
                        className="text-[#ef4444] hover:text-[#b91c1c] transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add User Modal ─────────────────────────────────────────────────────── */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          <div className="bg-white rounded-[24px] w-full max-w-lg p-[32px] relative shadow-xl z-10 mx-4 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-center mb-[24px]">
              <h2 className="font-heading font-bold text-[22px] text-[#0f172a]">Add New User</h2>
              <button onClick={() => setIsAddOpen(false)} className="text-[#9ca3af] hover:text-[#0f172a] transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="flex flex-col gap-[16px]">
              <div className="flex flex-col gap-2">
                <label className="font-sans text-[13px] font-medium text-[#6b7280]">Full Name</label>
                <input name="name" required type="text" placeholder="John Doe" className="h-[48px] border border-[#e8edf5] rounded-[10px] px-[16px] focus:outline-none focus:border-[#0f4ff1] transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-sans text-[13px] font-medium text-[#6b7280]">Email Address</label>
                <input name="email" required type="email" placeholder="john@example.com" className="h-[48px] border border-[#e8edf5] rounded-[10px] px-[16px] focus:outline-none focus:border-[#0f4ff1] transition-colors" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[13px] font-medium text-[#6b7280]">Role</label>
                  <div className="relative">
                    <select name="role" className="w-full h-[48px] border border-[#e8edf5] rounded-[10px] px-[16px] focus:outline-none focus:border-[#0f4ff1] bg-white appearance-none cursor-pointer">
                      <option value="Student">Student</option>
                      <option value="Instructor">Instructor</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" size={16} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[13px] font-medium text-[#6b7280]">Start Level</label>
                  <div className="relative">
                    <select 
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full h-[48px] border border-[#e8edf5] rounded-[10px] px-[16px] focus:outline-none focus:border-[#0f4ff1] bg-white appearance-none cursor-pointer"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" size={16} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans text-[13px] font-medium text-[#6b7280]">Assign Course Groups</label>
                <div className="flex flex-wrap gap-2 p-3 border border-[#e8edf5] rounded-[10px] min-h-[48px]">
                   {courseGroups.length === 0 ? (
                     <span className="text-[12px] text-[#9ca3af]">No course groups available.</span>
                   ) : (
                     courseGroups.map(group => (
                       <button
                         key={group}
                         type="button"
                         onClick={() => toggleGroup(group)}
                         className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${selectedGroups.includes(group) ? 'bg-[#0f4ff1] text-white' : 'bg-[#f1f5f9] text-[#6b7280] hover:bg-[#e2e8f0]'}`}
                       >
                         {group}
                       </button>
                     ))
                   )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans text-[13px] font-medium text-[#6b7280]">Assign Cohort</label>
                <div className="relative">
                  <select name="learning_path" className="w-full h-[48px] border border-[#e8edf5] rounded-[10px] px-[16px] focus:outline-none focus:border-[#0f4ff1] bg-white appearance-none cursor-pointer">
                    <option value="">None</option>
                    {cohorts.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" size={16} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-[8px] bg-[#0f4ff1] text-white font-heading font-semibold text-[15px] h-[48px] rounded-[12px] hover:bg-[#093094] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : "Create User"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Student Progress Drawer ────────────────────────────────────────────── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="w-full max-w-[480px] bg-white h-full relative z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.05)] border-l border-[#e8edf5] flex flex-col animate-slide-in-right">

            <div className="h-[72px] border-b border-[#e8edf5] px-[24px] flex items-center justify-between shrink-0">
              <h3 className="font-heading font-bold text-[18px] text-[#0f172a]">Student Profile</h3>
              <button onClick={() => setSelectedUser(null)} className="p-2 rounded-full hover:bg-[#f1f5f9] text-[#6b7280] transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-[24px] font-sans scrollbar-hide">

              {/* Header */}
              <div className="flex gap-[16px] items-center mb-[32px]">
                <Link 
                  href={`/admin/users/${selectedUser.user_id}/settings`}
                  className="w-[64px] h-[64px] rounded-full bg-[#1e293b] text-white flex items-center justify-center font-heading font-bold text-[24px] shrink-0 overflow-hidden hover:ring-4 hover:ring-[#0f4ff1]/10 transition-all cursor-pointer"
                >
                  {selectedUser.avatar_url ? (
                    <img
                      src={selectedUser.avatar_url.startsWith("http") ? selectedUser.avatar_url : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${selectedUser.avatar_url}`}
                      alt={selectedUser.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (selectedUser.full_name || "?").charAt(0).toUpperCase()
                  )}
                </Link>
                <div className="flex flex-col">
                  <span className="font-heading font-bold text-[20px] text-[#0f172a]">{selectedUser.full_name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[13px] text-[#6b7280]">{selectedUser.email}</span>
                    <span className="text-[#e8edf5]">|</span>
                    <span className="text-[12px] font-bold text-[#0f4ff1] uppercase tracking-wider">{selectedUser.cohorts?.name || "No Cohort"}</span>
                  </div>
                  <span className="text-[12px] text-[#9ca3af] mt-2 flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                    Joined: {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </span>
                </div>
              </div>

              {/* Progress Ring (FIX 10E) */}
              <div className="mb-[32px] bg-[#f9fafb] border border-[#e8edf5] rounded-[16px] p-[20px] flex items-center gap-[24px]">
                <div className="relative w-[80px] h-[80px] flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e8edf5" strokeWidth="3" />
                    <path 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                      fill="none" stroke="#0f4ff1" strokeWidth="3" 
                      strokeDasharray={`${selectedUser.activeEnrollment?.progress_percent || 0}, 100`} 
                    />
                  </svg>
                  <span className="absolute font-heading font-bold text-[16px] text-[#0f172a]">{selectedUser.activeEnrollment?.progress_percent || 0}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-semibold text-[15px] text-[#0f172a] line-clamp-1">
                    {selectedUser.activeEnrollment?.courses?.title || "No Active Course"}
                  </span>
                  <span className="text-[13px] text-[#6b7280] mt-1">
                    {selectedUser.activeEnrollment ? `${selectedUser.activeEnrollment.progress_percent || 0}% Completed` : "Enrollment pending"}
                  </span>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="mb-[32px]">
                <div className="flex items-center justify-between mb-[12px]">
                  <h4 className="font-heading font-bold text-[15px] text-[#0f172a]">Admin Notes</h4>
                  {isSavingNotes ? (
                    <span className="flex items-center gap-1.5 text-[12px] text-[#9ca3af]">
                      <Loader2 size={12} className="animate-spin" /> Saving...
                    </span>
                  ) : showSavedNotes ? (
                    <span className="text-[12px] text-[#16a34a] font-medium">Saved</span>
                  ) : null}
                </div>
                <textarea
                  className="w-full min-h-[120px] p-[16px] border border-[#e8edf5] rounded-[12px] text-[14px] text-[#4b5563] focus:outline-none focus:border-[#0f4ff1] resize-none transition-colors"
                  placeholder="Add internal notes about this student..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
                <p className="text-[12px] text-[#9ca3af] mt-2">Auto-saved as you type. Visible to Admins only.</p>
              </div>

              {/* Course Progress Breakdown */}
              <div>
                <h4 className="font-heading font-bold text-[15px] text-[#0f172a] mb-[16px]">Curriculum Breakdown</h4>
                <div className="flex flex-col gap-4">
                  {selectedUserProgress.length === 0 ? (
                    <p className="text-[13px] text-[#9ca3af] py-4 text-center border border-dashed rounded-xl">No progress data yet.</p>
                  ) : (
                    selectedUserProgress.map((p, i) => (
                      <div key={i} className="flex flex-col gap-2 p-3 border border-[#f1f5f9] rounded-xl bg-white shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-sans font-semibold text-[13px] text-[#0f172a] line-clamp-1">{p.lessons?.title || "Unknown Lesson"}</span>
                          <span className="font-sans font-bold text-[11px] text-[#0f4ff1]">{p.watch_percent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                          <div className="h-full bg-[#0f4ff1] rounded-full" style={{ width: `${p.watch_percent}%` }} />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-[#9ca3af]">
                          <span>{p.completed ? "Completed" : "In Progress"}</span>
                          <span>{p.updated_at ? new Date(p.updated_at).toLocaleDateString() : ""}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="mt-8 pt-6 border-t border-[#f1f5f9] flex gap-3">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 h-[48px] rounded-[12px] font-heading font-semibold text-[14px] text-[#6b7280] border border-[#e8edf5] hover:bg-[#f8fafc] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    success("Student profile updated");
                    setSelectedUser(null);
                  }}
                  className="flex-1 h-[48px] bg-[#0f4ff1] text-white rounded-[12px] font-heading font-semibold text-[14px] hover:bg-[#093094] transition-colors shadow-lg shadow-blue-100"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
