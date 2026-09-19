import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Compass, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const returnTo = searchParams.get("returnTo");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);

      toast.success("Welcome back!");

      setLocation(returnTo || "/");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const registerPath = returnTo
    ? `/register?returnTo=${encodeURIComponent(returnTo)}`
    : "/register";

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

            <span className="font-serif text-2xl font-bold text-espresso">
              BookMyStay
            </span>
          </div>

          <h1 className="font-serif text-3xl font-bold text-espresso mb-2">
            Welcome Back
          </h1>

          <p className="text-muted-foreground mb-8">
            Sign in to continue your journey with us.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-white rounded-xl border border-warm-stone/30 text-espresso placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-bronze/20 focus:border-bronze/40 transition-all text-sm pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-espresso transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-bronze hover:bg-bronze-dark text-white font-semibold py-3 rounded-xl transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Don't have an account?{" "}

            <a
              href={registerPath}
              className="text-bronze font-medium hover:text-bronze-dark transition-colors"
            >
              Create one
            </a>
          </p>
        </motion.div>
      </div>

      {/* Right - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://plus.unsplash.com/premium_photo-1661919210043-fd847a58522d?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Luxury resort"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        <div className="absolute bottom-12 left-12 right-12">
          <p className="text-white/80 text-sm italic">
            "Every stay should feel like a homecoming, but extraordinary."
          </p>

          <p className="text-white/50 text-xs mt-2">
            — BookMyStay Philosophy
          </p>
        </div>
      </div>
    </div>
  );
}