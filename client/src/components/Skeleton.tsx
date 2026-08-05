import { cn } from "@/lib/utils";

export function HotelCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-warm animate-pulse">
      <div className="h-56 bg-warm-stone/50" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-warm-stone/50 rounded w-3/4" />
        <div className="h-4 bg-warm-stone/40 rounded w-1/2" />
        <div className="h-4 bg-warm-stone/40 rounded w-full" />
        <div className="h-4 bg-warm-stone/40 rounded w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-warm-stone/50 rounded w-24" />
          <div className="h-8 bg-warm-stone/50 rounded-full w-28" />
        </div>
      </div>
    </div>
  );
}

export function ReviewSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-warm animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-warm-stone/50 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-warm-stone/50 rounded w-1/3" />
          <div className="h-3 bg-warm-stone/40 rounded w-1/4" />
          <div className="h-4 bg-warm-stone/40 rounded w-full" />
          <div className="h-4 bg-warm-stone/40 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function BookingSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-warm animate-pulse">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-72 h-48 bg-warm-stone/50" />
        <div className="flex-1 p-6 space-y-3">
          <div className="h-5 bg-warm-stone/50 rounded w-3/4" />
          <div className="h-4 bg-warm-stone/40 rounded w-1/2" />
          <div className="flex gap-4 pt-2">
            <div className="h-4 bg-warm-stone/40 rounded w-24" />
            <div className="h-4 bg-warm-stone/40 rounded w-24" />
          </div>
          <div className="h-4 bg-warm-stone/40 rounded w-1/3 pt-2" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-warm">
            <div className="h-4 bg-warm-stone/50 rounded w-1/2 mb-4" />
            <div className="h-8 bg-warm-stone/50 rounded w-1/3" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-6 shadow-warm">
        <div className="h-6 bg-warm-stone/50 rounded w-1/3 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-warm-stone/30 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TextSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("h-4 bg-warm-stone/50 rounded animate-pulse", className)} />
  );
}

export function ImageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-warm-stone/50 animate-pulse", className)} />
  );
}
