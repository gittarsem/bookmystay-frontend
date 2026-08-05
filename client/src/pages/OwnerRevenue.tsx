import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DollarSign } from "lucide-react";

export default function OwnerRevenue() {
  return (
    <ProtectedRoute requiredRole="ROLE_OWNER">
      <DashboardLayout role="owner">
        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-espresso">Revenue</h1>
            <p className="text-sm text-muted-foreground">Track your earnings and financial performance</p>
          </div>
          <div className="bg-white rounded-xl shadow-warm border border-warm-stone/20 p-12 text-center">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Revenue analytics and reporting coming soon.</p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
