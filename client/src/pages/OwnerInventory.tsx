import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function OwnerInventory() {
  return (
    <ProtectedRoute requiredRole="ROLE_OWNER">
      <DashboardLayout role="owner">
        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-espresso">Inventory</h1>
            <p className="text-sm text-muted-foreground">Manage room availability and pricing</p>
          </div>

          <div className="bg-white rounded-xl shadow-warm border border-warm-stone/20 p-8 text-center">
            <p className="text-muted-foreground">
              Inventory management allows you to control room availability, seasonal pricing,
              and capacity across all your properties. Feature coming soon.
            </p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
