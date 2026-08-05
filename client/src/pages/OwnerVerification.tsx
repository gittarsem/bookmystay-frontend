import { useState } from "react";
import { ShieldCheck, Upload, FileText, CheckCircle2, Clock, XCircle } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "sonner";

export default function OwnerVerification() {
  const [step, setStep] = useState<"idle" | "submitted">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("submitted");
    toast.success("Verification application submitted successfully");
  };

  return (
    <ProtectedRoute requiredRole="ROLE_OWNER">
      <DashboardLayout role="owner">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-bronze/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-bronze" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-espresso">Owner Verification</h1>
            <p className="text-muted-foreground mt-2">
              Complete verification to unlock all owner features and manage properties.
            </p>
          </div>

          {step === "idle" ? (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-warm border border-warm-stone/20 p-8 space-y-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="As per government ID"
                  className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-stone/30 text-sm focus:outline-none focus:ring-2 focus:ring-bronze/20"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">
                  PAN Card Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ABCDE1234F"
                  className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-stone/30 text-sm focus:outline-none focus:ring-2 focus:ring-bronze/20"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">
                  GST Number (if applicable)
                </label>
                <input
                  type="text"
                  placeholder="22AAAAA0000A1Z5"
                  className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-stone/30 text-sm focus:outline-none focus:ring-2 focus:ring-bronze/20"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">
                  ID Proof Document *
                </label>
                <div className="border-2 border-dashed border-warm-stone/50 rounded-xl p-8 text-center hover:border-bronze/40 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Upload PAN card, Aadhaar, or Passport
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG, or PNG (max 5MB)</p>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-bronze hover:bg-bronze-dark text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.97]"
              >
                Submit Verification
              </button>
            </form>
          ) : (
            <div className="bg-white rounded-xl shadow-warm border border-warm-stone/20 p-8 text-center">
              <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-serif text-xl font-semibold text-espresso mb-2">
                Verification Under Review
              </h3>
              <p className="text-muted-foreground">
                Your documents are being reviewed by our team. This typically takes 1-2 business days.
                You'll receive a notification once your account is verified.
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
