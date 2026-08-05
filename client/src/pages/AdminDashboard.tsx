import { motion } from "framer-motion";
import {
  Users,
  Building2,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

const stats = [
  { label: "Total Users", value: "12,450", change: "+120", icon: Users, color: "bg-blue-50 text-blue-600" },
  { label: "Total Hotels", value: "847", change: "+23", icon: Building2, color: "bg-purple-50 text-purple-600" },
  { label: "Total Revenue", value: "₹45.2L", change: "+8.3%", icon: DollarSign, color: "bg-green-50 text-green-600" },
  { label: "Active Bookings", value: "1,234", change: "+45", icon: TrendingUp, color: "bg-yellow-50 text-yellow-600" },
  { label: "Pending Verifications", value: "18", change: "", icon: AlertCircle, color: "bg-red-50 text-red-600" },
  { label: "Verified Owners", value: "156", change: "+7", icon: ShieldCheck, color: "bg-sage/10 text-sage" },
];

const recentActivities = [
  { type: "User Signup", detail: "priya.sharma@gmail.com joined", time: "5 min ago", icon: Users },
  { type: "Hotel Approved", detail: "Wildflower Hall Shimla verified", time: "1 hour ago", icon: Building2 },
  { type: "Payment Received", detail: "₹75,000 from BK-001", time: "2 hours ago", icon: DollarSign },
  { type: "Verification Request", detail: "Vikram Singh submitted documents", time: "3 hours ago", icon: ShieldCheck },
  { type: "New Booking", detail: "Ananya Patel booked Amanbagh", time: "5 hours ago", icon: TrendingUp },
];

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="ROLE_ADMIN">
      <DashboardLayout role="admin">
        <div className="space-y-8">
          <div>
            <h1 className="font-serif text-2xl font-bold text-espresso">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Platform overview and management</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-warm border border-warm-stone/20"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-espresso">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                {stat.change && (
                  <p className="text-xs text-sage font-medium mt-1">{stat.change}</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-warm border border-warm-stone/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-warm-stone/20">
              <h3 className="font-serif text-lg font-semibold text-espresso">Recent Activity</h3>
            </div>
            <div className="divide-y divide-warm-stone/20">
              {recentActivities.map((activity, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-cream/50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-bronze/10 flex items-center justify-center shrink-0">
                    <activity.icon className="w-4 h-4 text-bronze" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-espresso">{activity.type}</p>
                    <p className="text-xs text-muted-foreground">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Manage Users", desc: "View, edit, or suspend user accounts", action: "View Users" },
              { title: "Verify Owners", desc: "Review and approve owner verification requests", action: "Review" },
              { title: "Platform Settings", desc: "Configure platform-wide settings and policies", action: "Configure" },
            ].map((card) => (
              <div key={card.title} className="bg-white rounded-xl shadow-warm border border-warm-stone/20 p-6">
                <h4 className="font-semibold text-espresso mb-1">{card.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">{card.desc}</p>
                <button className="text-sm text-bronze font-medium hover:text-bronze-dark transition-colors">
                  {card.action} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
