import { Link } from "wouter";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center">
        <Compass className="w-16 h-16 text-bronze/30 mx-auto mb-6" />
        <h1 className="font-serif text-6xl font-bold text-espresso mb-2">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          This page seems to have wandered off.
        </p>
        <Link href="/">
          <button className="bg-bronze hover:bg-bronze-dark text-white font-semibold px-8 py-3 rounded-xl transition-all active:scale-[0.97]">
            Return Home
          </button>
        </Link>
      </div>
    </div>
  );
}
