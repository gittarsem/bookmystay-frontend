import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Eye } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

const bookings = [
  { id: "BK-001", hotel: "The Amanbagh Resort", guest: "Priya Sharma", checkIn: "2025-03-15", checkOut: "2025-03-18", amount: 75000, status: "Confirmed" },
  { id: "BK-002", hotel: "Wildflower Hall", guest: "Rahul Verma", checkIn: "2025-03-20", checkOut: "2025-03-25", amount: 150000, status: "Pending" },
  { id: "BK-003", hotel: "The Amanbagh Resort", guest: "Ananya Patel", checkIn: "2025-04-01", checkOut: "2025-04-05", amount: 200000, status: "Confirmed" },
];

export default function OwnerBookings() {
  return (
    <ProtectedRoute requiredRole="ROLE_OWNER">
      <DashboardLayout role="owner">
        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-espresso">Bookings</h1>
            <p className="text-sm text-muted-foreground">View and manage all guest reservations</p>
          </div>

          <div className="space-y-4">
            {bookings.map((b, index) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-warm border border-warm-stone/20 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{b.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        b.status === "Confirmed" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                      }`}>{b.status}</span>
                    </div>
                    <h3 className="font-semibold text-espresso">{b.hotel}</h3>
                    <p className="text-sm text-muted-foreground">Guest: {b.guest}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Check In → Out</p>
                      <p className="text-sm font-medium text-espresso">{b.checkIn} → {b.checkOut}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-lg font-bold text-espresso">₹{b.amount.toLocaleString()}</p>
                    </div>
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
