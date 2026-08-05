import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, UserCheck, Ban } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "sonner";

const users = [
  { id: "u1", name: "Priya Sharma", email: "priya@gmail.com", role: "USER", status: "Active", createdAt: "2025-01-15" },
  { id: "u2", name: "John Doe", email: "john@owner.com", role: "OWNER", status: "Active", createdAt: "2025-02-01" },
  { id: "u3", name: "Admin User", email: "admin@bookmystay.com", role: "ADMIN", status: "Active", createdAt: "2024-12-01" },
  { id: "u4", name: "Rahul Verma", email: "rahul@gmail.com", role: "USER", status: "Suspended", createdAt: "2025-03-10" },
];

export default function AdminUsers() {
  const [userList, setUserList] = useState(users);

  const toggleSuspend = (userId: string) => {
    setUserList(userList.map((u) =>
      u.id === userId ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u
    ));
    toast.success("User status updated");
  };

  return (
    <ProtectedRoute requiredRole="ROLE_ADMIN">
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-espresso">Manage Users</h1>
            <p className="text-sm text-muted-foreground">View and manage all platform users</p>
          </div>

          <div className="bg-white rounded-xl shadow-warm border border-warm-stone/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-warm-stone/20">
                    <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground font-medium">User</th>
                    <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground font-medium">Role</th>
                    <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground font-medium">Status</th>
                    <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground font-medium">Joined</th>
                    <th className="text-right px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-stone/20">
                  {userList.map((user, index) => (
                    <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }} className="hover:bg-cream/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-sm text-espresso">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "ADMIN" ? "bg-purple-50 text-purple-600" :
                          user.role === "OWNER" ? "bg-bronze/10 text-bronze" : "bg-blue-50 text-blue-600"
                        }`}>
                          {user.role === "ADMIN" && <Shield className="w-3 h-3" />}
                          {user.role === "OWNER" && <UserCheck className="w-3 h-3" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.status === "Active" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{user.createdAt}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleSuspend(user.id)}
                          disabled={user.role === "ADMIN"}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.status === "Active"
                              ? "hover:bg-red-50 text-muted-foreground hover:text-red-600"
                              : "hover:bg-green-50 text-muted-foreground hover:text-green-600"
                          } disabled:opacity-30 disabled:cursor-not-allowed`}
                        >
                          {user.status === "Active" ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
