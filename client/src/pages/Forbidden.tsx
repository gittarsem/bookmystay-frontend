import { Link } from "wouter";
import { ArrowLeft, ShieldX } from "lucide-react";
import { motion } from "framer-motion";

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-bronze/10 flex items-center justify-center">
          <ShieldX className="w-7 h-7 text-bronze" />
        </div>

        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-bronze font-semibold">
          Access restricted
        </p>

        <h1 className="mt-3 font-serif text-4xl font-semibold text-espresso">
          Access denied
        </h1>

        <p className="mt-4 text-muted-foreground leading-relaxed">
          You don't currently have permission to access this area.
        </p>

        <Link href="/">
          <button
            type="button"
            className="mt-7 inline-flex items-center gap-2 px-6 py-3 bg-bronze hover:bg-bronze-dark text-white rounded-xl font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return Home
          </button>
        </Link>
      </motion.div>
    </div>
  );
}