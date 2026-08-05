import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2, XCircle, FileText, Clock } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "sonner";

const verifications = [
  { id: "v1", ownerName: "John Doe", email: "john@owner.com", document: "PAN Card", submittedAt: "2025-03-15", status: "Pending" },
  { id: "v2", ownerName: "Sarah Khan", email: "sarah@owner.com", document: "Aadhaar", submittedAt: "2025-03-14", status: "Pending" },
  { id: "v3", ownerName: "Vikram Singh", email: "vikram@owner.com", document: "Passport", submittedAt: "2025-03-12", status: "Approved" },
  { id: "v4", ownerName: "Priya Patel", email: "priya@owner.com", document: "PAN Card", submittedAt: "2025-03-10", status: "Rejected" },
];

export default function AdminVerification() {
  const [items, setItems] = useState(verifications);

  const approve = (id: string) => {
    setItems(items.map((v) =>
      v.id === id ? { ...v, status: "Approved" as const } : v
    ));
    toast.success("Verification approved");
  };

  const reject = (id: string) => {
    setItems(items.map((v) =>
      v.id === id ? { ...v, status: "Rejected" as const } : v
    ));
    toast.success("Verification rejected");
  };

  return (
    <ProtectedRoute requiredRole="ROLE_ADMIN">
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-espresso">Owner Verifications</h1>
            <p className="text-sm text-muted-foreground">Review and process owner verification requests</p>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-warm border border-warm-stone/20 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-bronze/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-bronze" />
                    </div>
                    <div>
                      <p className="font-medium text-espresso">{item.ownerName}</p>
                      <p className="text-sm text-muted-foreground">{item.email} • {item.document}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Submitted: {item.submittedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "Approved" ? "bg-green-50 text-green-600" :
                      item.status === "Rejected" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-600"
                    }`}>
                      {item.status}
                    </span>
                    {item.status === "Pending" && (
                      <>
                        <button onClick={() => approve(item.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => reject(item.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
