import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Power, Eye, X } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "sonner";
import { ownerHotelsApi } from "@/api";

const sampleHotels = [
  { id: "1", name: "The Amanbagh Resort", city: "Alwar", status: "Active", rooms: 8, bookings: 24 },
  { id: "2", name: "Wildflower Hall Shimla", city: "Shimla", status: "Active", rooms: 6, bookings: 18 },
  { id: "3", name: "Heritage Stay Jaipur", city: "Jaipur", status: "Inactive", rooms: 4, bookings: 0 },
];

export default function OwnerHotels() {
  const [hotels, setHotels] = useState(sampleHotels);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "", city: "", state: "", country: "India", address: "",
    description: "", latitude: "", longitude: "", amenities: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In production: await ownerHotelsApi.create(formData)
      const newHotel = {
        id: String(Date.now()),
        name: formData.name,
        city: formData.city,
        status: "Inactive",
        rooms: 0,
        bookings: 0,
      };
      setHotels([...hotels, newHotel]);
      setShowForm(false);
      setFormData({ name: "", city: "", state: "", country: "India", address: "", description: "", latitude: "", longitude: "", amenities: "" });
      toast.success("Hotel created successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create hotel");
    }
  };

  const toggleStatus = async (hotelId: string) => {
    try {
      // In production: await ownerHotelsApi.activate(hotelId)
      setHotels(hotels.map((h) =>
        h.id === hotelId ? { ...h, status: h.status === "Active" ? "Inactive" : "Active" } : h
      ));
      toast.success("Hotel status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const deleteHotel = async (hotelId: string) => {
    if (!window.confirm("Are you sure you want to delete this hotel?")) return;
    try {
      // In production: await ownerHotelsApi.delete(hotelId)
      setHotels(hotels.filter((h) => h.id !== hotelId));
      toast.success("Hotel deleted");
    } catch {
      toast.error("Failed to delete hotel");
    }
  };

  return (
    <ProtectedRoute requiredRole="ROLE_OWNER">
      <DashboardLayout role="owner">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-espresso">My Hotels</h1>
              <p className="text-sm text-muted-foreground">Manage your property listings</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-bronze hover:bg-bronze-dark text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.97]"
            >
              <Plus className="w-4 h-4" /> Add Hotel
            </button>
          </div>

          {/* Hotels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotels.map((hotel, index) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-warm border border-warm-stone/20 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-espresso">{hotel.name}</h3>
                    <p className="text-sm text-muted-foreground">{hotel.city}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    hotel.status === "Active" ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-500"
                  }`}>
                    {hotel.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="bg-cream rounded-lg px-3 py-2">
                    <p className="text-muted-foreground text-xs">Rooms</p>
                    <p className="font-semibold text-espresso">{hotel.rooms}</p>
                  </div>
                  <div className="bg-cream rounded-lg px-3 py-2">
                    <p className="text-muted-foreground text-xs">Bookings</p>
                    <p className="font-semibold text-espresso">{hotel.bookings}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleStatus(hotel.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      hotel.status === "Active"
                        ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {hotel.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => deleteHotel(hotel.id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Add Hotel Modal */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
                onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-warm-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-serif text-xl font-bold text-espresso">Add New Hotel</h2>
                      <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-espresso">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1 block">Hotel Name *</label>
                        <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2.5 bg-cream rounded-lg border border-warm-stone/30 text-sm focus:outline-none focus:ring-2 focus:ring-bronze/20" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1 block">City *</label>
                          <input required type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-3 py-2.5 bg-cream rounded-lg border border-warm-stone/30 text-sm focus:outline-none focus:ring-2 focus:ring-bronze/20" />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1 block">State</label>
                          <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full px-3 py-2.5 bg-cream rounded-lg border border-warm-stone/30 text-sm focus:outline-none focus:ring-2 focus:ring-bronze/20" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1 block">Address</label>
                        <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-3 py-2.5 bg-cream rounded-lg border border-warm-stone/30 text-sm focus:outline-none focus:ring-2 focus:ring-bronze/20" />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1 block">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2.5 bg-cream rounded-lg border border-warm-stone/30 text-sm focus:outline-none focus:ring-2 focus:ring-bronze/20 resize-none" />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg border border-warm-stone/30 text-sm font-medium text-espresso hover:bg-cream transition-colors">
                          Cancel
                        </button>
                        <button type="submit" className="flex-1 bg-bronze hover:bg-bronze-dark text-white py-2.5 rounded-lg text-sm font-medium transition-all active:scale-[0.97]">
                          Create Hotel
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
