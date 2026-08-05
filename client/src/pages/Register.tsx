import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Compass, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Account created successfully!");
      setLocation("/");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-2 mb-10">
            <Compass className="w-8 h-8 text-bronze" />
            <span className="font-serif text-2xl font-bold text-espresso">BookMyStay</span>
          </div>

          <h1 className="font-serif text-3xl font-bold text-espresso mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground mb-8">
            Begin your journey to extraordinary stays.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your full name"
                className="w-full px-4 py-3 bg-white rounded-xl border border-warm-stone/30 text-espresso placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-bronze/20 focus:border-bronze/40 transition-all text-sm"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white rounded-xl border border-warm-stone/30 text-espresso placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-bronze/20 focus:border-bronze/40 transition-all text-sm"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-3 bg-white rounded-xl border border-warm-stone/30 text-espresso placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-bronze/20 focus:border-bronze/40 transition-all text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-espresso transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat your password"
                className="w-full px-4 py-3 bg-white rounded-xl border border-warm-stone/30 text-espresso placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-bronze/20 focus:border-bronze/40 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-bronze hover:bg-bronze-dark text-white font-semibold py-3 rounded-xl transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-bronze font-medium hover:text-bronze-dark transition-colors">
              Sign in
            </a>
          </p>
        </motion.div>
      </div>

      {/* Right - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
        src="https://media.cntraveller.com/photos/66cd9a6cdc0c409d606dcb72/4:3/w_4852,h_3639,c_limit/maldives-best%20all%20inclusive%20hotel%20maldives-GettyImages-1406869055.jpg" 
          alt="Luxury destination"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12">
          <p className="text-white/80 text-sm italic">
            "Join a community of travelers who seek the extraordinary in every journey."
          </p>
          <p className="text-white/50 text-xs mt-2">— BookMyStay Community</p>
        </div>
      </div>
    </div>
  );
}
