import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Eye } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "sonner";

const hotels = [
  { id: "h1", name: "The Amanbagh Resort", owner: "John Doe", city: "Alwar", status: "Active", verified: true },
  { id: "h2", name: "Wildflower Hall", owner: "Jane Smith", city: "Shimla", status: "Active", verified: true },
  { id: "h3", name: "Heritage Stay Jaipur", owner: "Raj Patel", city: "Jaipur", status: "Inactive", verified: false },
  { id: "h4", name: "Beach Palace Goa", owner: "Sarah Khan", city: "Goa", status: "Pending", verified: false },
];

export default function AdminHotels() {
  const [hotelList, setHotelList] = useState(hotels);

  const approve = (id: string) => {
    setHotelList(hotelList.map((h) =>
      h.id === id ? { ...h, verified: true, status: "Active" as const } : h
    ));
    toast.success("Hotel approved");
  };

  const reject = (id: string) => {
    setHotelList(hotelList.map((h) =>
      h.id === id ? { ...h, verified: false, status: "Inactive" as const } : h
    ));
    toast.success("Hotel rejected");
  };

  return (
    <ProtectedRoute requiredRole="ROLE_ADMIN">
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-espresso">Manage Hotels</h1>
            <p className="text-sm text-muted-foreground">Review and manage all platform hotels</p>
          </div>

          <div className="bg-white rounded-xl shadow-warm border border-warm-stone/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-warm-stone/20">
                    <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground font-medium">Hotel</th>
                    <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground font-medium">Owner</th>
                    <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground font-medium">City</th>
                    <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground font-medium">Status</th>
                    <th className="text-right px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-stone/20">
                  {hotelList.map((hotel, index) => (
                    <motion.tr key={hotel.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }} className="hover:bg-cream/50">
                      <td className="px-6 py-4 font-medium text-sm text-espresso">{hotel.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{hotel.owner}</td>
                      <td className="px-6 py-4 text-sm text-espresso">{hotel.city}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          hotel.status === "Active" ? "bg-green-50 text-green-600" :
                          hotel.status === "Pending" ? "bg-yellow-50 text-yellow-600" : "bg-gray-50 text-gray-500"
                        }`}>
                          {hotel.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!hotel.verified ? (
                            <>
                              <button onClick={() => approve(hotel.id)} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100">
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => reject(hotel.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-green-600 font-medium">Verified</span>
                          )}
                        </div>
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
