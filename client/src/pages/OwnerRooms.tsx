import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "sonner";

const sampleRooms = [
  { id: "r1", hotelId: "1", hotelName: "The Amanbagh Resort", type: "Deluxe Suite", price: 25000, capacity: 2, available: true },
  { id: "r2", hotelId: "1", hotelName: "The Amanbagh Resort", type: "Luxury Villa", price: 45000, capacity: 4, available: true },
  { id: "r3", hotelId: "2", hotelName: "Wildflower Hall Shimla", type: "Mountain View Suite", price: 30000, capacity: 2, available: true },
  { id: "r4", hotelId: "2", hotelName: "Wildflower Hall Shimla", type: "Fireplace Room", price: 18000, capacity: 2, available: false },
];

export default function OwnerRooms() {
  const [rooms, setRooms] = useState(sampleRooms);

  const deleteRoom = async (roomId: string) => {
    if (!window.confirm("Delete this room?")) return;
    setRooms(rooms.filter((r) => r.id !== roomId));
    toast.success("Room deleted");
  };

  return (
    <ProtectedRoute requiredRole="ROLE_OWNER">
      <DashboardLayout role="owner">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-espresso">Manage Rooms</h1>
              <p className="text-sm text-muted-foreground">Manage rooms across all your properties</p>
            </div>
            <button
              onClick={() => toast("Room creation form would open here")}
              className="flex items-center gap-2 bg-bronze hover:bg-bronze-dark text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.97]"
            >
              <Plus className="w-4 h-4" /> Add Room
            </button>
          </div>

          {/* Rooms Table */}
          <div className="bg-white rounded-xl shadow-warm border border-warm-stone/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-warm-stone/20">
                    <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground font-medium">Room</th>
                    <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground font-medium">Hotel</th>
                    <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground font-medium">Price</th>
                    <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground font-medium">Capacity</th>
                    <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground font-medium">Status</th>
                    <th className="text-right px-6 py-3 text-xs uppercase tracking-widest text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-stone/20">
                  {rooms.map((room, index) => (
                    <motion.tr
                      key={room.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-cream/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-espresso text-sm">{room.type}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground">{room.hotelName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-espresso text-sm">₹{room.price.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-espresso">{room.capacity} guests</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          room.available ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                        }`}>
                          {room.available ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 rounded-lg hover:bg-cream text-muted-foreground hover:text-espresso transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteRoom(room.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
