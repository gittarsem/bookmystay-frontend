import { useState } from "react";
import { User } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "sonner";

export default function OwnerSettings() {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@owner.com",
    phone: "+91 98765 43210",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings updated successfully");
  };

  return (
    <ProtectedRoute requiredRole="ROLE_OWNER">
      <DashboardLayout role="owner">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-espresso">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account preferences</p>
          </div>

          <div className="bg-white rounded-xl shadow-warm border border-warm-stone/20 p-8">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-warm-stone/20">
              <div className="w-16 h-16 rounded-full bg-bronze/10 flex items-center justify-center">
                <User className="w-7 h-7 text-bronze" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-semibold text-espresso">Profile Information</h2>
                <p className="text-sm text-muted-foreground">Update your account details</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">Full Name</label>
                <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-stone/30 text-sm focus:outline-none focus:ring-2 focus:ring-bronze/20" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">Email</label>
                <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-stone/30 text-sm focus:outline-none focus:ring-2 focus:ring-bronze/20" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">Phone</label>
                <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-stone/30 text-sm focus:outline-none focus:ring-2 focus:ring-bronze/20" />
              </div>
              <button type="submit" className="bg-bronze hover:bg-bronze-dark text-white font-semibold px-8 py-3 rounded-xl transition-all active:scale-[0.97]">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
