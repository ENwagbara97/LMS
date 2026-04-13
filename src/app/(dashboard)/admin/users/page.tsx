import React from 'react';
import { Users, MoreVertical, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminUsersPage() {
  const { success } = useToast();
  const users = [
    { name: "Jane Student", email: "jane@university.edu", role: "Student", joined: "Oct 12, 2026", status: "Active" },
    { name: "Mark Admin", email: "mark@university.edu", role: "Instructor", joined: "Sep 01, 2026", status: "Active" },
    { name: "Sarah Connor", email: "sarahc@university.edu", role: "Student", joined: "Oct 15, 2026", status: "Inactive" },
  ];

  return (
    <div className="w-full flex-1 max-w-6xl pb-10">
       <div className="flex items-center justify-between mb-[32px]">
         <div>
            <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] leading-tight">Manage Users</h1>
            <p className="font-sans font-normal text-[15px] text-[#6b7280]">Add, remove, or change permission roles across the platform.</p>
         </div>
         <button 
           onClick={() => success("Saved successfully")}
           className="bg-[#0f4ff1] text-white h-[44px] rounded-[12px] px-[20px] font-heading font-semibold text-[14px] hover:bg-[#093094] transition-colors flex items-center gap-2"
         >
            <Plus size={16} />
            Add User
         </button>
       </div>

       <div className="bg-white border border-[#e8edf5] rounded-[16px] overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.05)] w-full">
         <table className="w-full text-left font-sans">
           <thead>
             <tr className="bg-[#f9fafb] border-b border-[#e8edf5] text-[12px] uppercase text-[#6b7280] font-semibold tracking-wider">
               <th className="px-6 py-4">Name</th>
               <th className="px-6 py-4">Role</th>
               <th className="px-6 py-4">Joined Date</th>
               <th className="px-6 py-4">Status</th>
               <th className="px-6 py-4"></th>
             </tr>
           </thead>
           <tbody>
             {users.map((u, i) => (
               <tr key={i} className="border-b border-[#f1f5f9] last:border-0 hover:bg-[#fdfefe] transition-colors">
                 <td className="px-6 py-4 flex flex-col">
                    <span className="font-heading font-semibold text-[14px] text-[#0f172a]">{u.name}</span>
                    <span className="text-[13px] text-[#6b7280]">{u.email}</span>
                 </td>
                 <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${u.role === 'Instructor' ? 'bg-[#eff4fe] text-[#0f4ff1]' : 'bg-[#f1f5f9] text-[#6b7280]'}`}>{u.role}</span>
                 </td>
                 <td className="px-6 py-4 text-[13px] text-[#4b5563]">{u.joined}</td>
                 <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${u.status === 'Active' ? 'text-[#16a34a]' : 'text-[#9ca3af]'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-[#16a34a]' : 'bg-[#9ca3af]'}`}></span>
                      {u.status}
                    </span>
                 </td>
                 <td className="px-6 py-4 text-right">
                    <button className="text-[#9ca3af] hover:text-[#0f172a] transition-colors"><MoreVertical size={16} /></button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
    </div>
  )
}
