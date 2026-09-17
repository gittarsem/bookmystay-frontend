import { Hotel, Sparkles } from "lucide-react";

interface BookMyStayLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export default function BookMyStayLoader({
  message = "Finding your perfect stay...",
  fullScreen = false,
}: BookMyStayLoaderProps) {
  return (
    <div
      className={
        fullScreen
          ? "fixed inset-0 z-[9999] flex items-center justify-center bg-background"
          : "flex min-h-[300px] w-full items-center justify-center"
      }
    >
      <div className="flex flex-col items-center justify-center">

        {/* Animated Hotel */}
        <div className="relative mb-6 h-24 w-24">

          {/* Floating sparkle - top left */}
          <Sparkles
            className="absolute -left-1 top-1 h-4 w-4 animate-[sparkle_2s_ease-in-out_infinite] text-[#B88A5A]"
            strokeWidth={1.5}
          />

          {/* Floating sparkle - top right */}
          <Sparkles
            className="absolute -right-2 top-5 h-3.5 w-3.5 animate-[sparkle_2s_ease-in-out_0.7s_infinite] text-[#B88A5A]"
            strokeWidth={1.5}
          />

          {/* Hotel shadow */}
          <div
            className="
              absolute
              bottom-1
              left-1/2
              h-2
              w-14
              -translate-x-1/2
              rounded-full
              bg-black/10
              blur-[3px]
              animate-[shadowPulse_1.8s_ease-in-out_infinite]
            "
          />

          {/* Hotel Icon */}
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              animate-[hotelFloat_1.8s_ease-in-out_infinite]
            "
          >
            <Hotel
              className="h-16 w-16 text-[#B88A5A]"
              strokeWidth={1.5}
            />

            {/* Window lights */}
            <div className="absolute left-[29px] top-[31px] grid grid-cols-2 gap-[5px]">
              <span className="h-[4px] w-[4px] rounded-[1px] bg-[#B88A5A] animate-[windowLight_2s_ease-in-out_infinite]" />
              <span className="h-[4px] w-[4px] rounded-[1px] bg-[#B88A5A] animate-[windowLight_2s_ease-in-out_0.3s_infinite]" />
              <span className="h-[4px] w-[4px] rounded-[1px] bg-[#B88A5A] animate-[windowLight_2s_ease-in-out_0.6s_infinite]" />
              <span className="h-[4px] w-[4px] rounded-[1px] bg-[#B88A5A] animate-[windowLight_2s_ease-in-out_0.9s_infinite]" />
            </div>
          </div>
        </div>

        {/* Brand */}
        <div className="text-center">
          <h2
            className="
              text-xl
              font-semibold
              tracking-[0.18em]
              text-foreground
            "
          >
            BOOKMYSTAY
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {message}
          </p>
        </div>

        {/* Animated dots — NOT a spinner */}
        <div className="mt-4 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#B88A5A] animate-[dotPulse_1.4s_ease-in-out_infinite]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#B88A5A] animate-[dotPulse_1.4s_ease-in-out_0.2s_infinite]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#B88A5A] animate-[dotPulse_1.4s_ease-in-out_0.4s_infinite]" />
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes hotelFloat {
          0%,
          100% {
            transform: translateY(3px);
          }

          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes shadowPulse {
          0%,
          100% {
            transform: translateX(-50%) scaleX(1);
            opacity: 0.18;
          }

          50% {
            transform: translateX(-50%) scaleX(0.72);
            opacity: 0.08;
          }
        }

        @keyframes windowLight {
          0%,
          100% {
            opacity: 0.25;
            transform: scale(0.8);
          }

          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes sparkle {
          0%,
          100% {
            opacity: 0.2;
            transform: translateY(2px) scale(0.8);
          }

          50% {
            opacity: 1;
            transform: translateY(-4px) scale(1);
          }
        }

        @keyframes dotPulse {
          0%,
          100% {
            opacity: 0.25;
            transform: translateY(0);
          }

          50% {
            opacity: 1;
            transform: translateY(-2px);
          }
        }
      `}</style>
    </div>
  );
}
