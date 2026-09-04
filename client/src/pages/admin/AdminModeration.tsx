import { motion } from "framer-motion";
import {
  ShieldCheck,
  Search,
  Flag,
  MessageSquareWarning,
  Hotel,
  UserRound,
  AlertTriangle,
} from "lucide-react";

export default function AdminModeration() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Platform safety
        </p>

        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-espresso mt-2">
          Moderation
        </h1>

        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Review potentially problematic users, properties,
          reviews and other platform content.
        </p>
      </motion.div>

      {/* Search / filters */}
      <div
        className="
          bg-white
          border
          border-warm-stone/30
          rounded-2xl
          p-4
        "
      >
        <div className="flex flex-col lg:flex-row gap-3">

          <div className="relative flex-1">
            <Search
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                w-4
                h-4
                text-muted-foreground
              "
            />

            <input
              type="text"
              placeholder="Search moderation items..."
              className="
                w-full
                h-11
                pl-10
                pr-4
                rounded-xl
                border
                border-warm-stone/40
                bg-cream/30
                text-sm
                text-espresso
                placeholder:text-muted-foreground
                outline-none
                focus:border-bronze
                focus:ring-2
                focus:ring-bronze/10
              "
            />
          </div>

          <select
            defaultValue="all"
            className="
              h-11
              px-4
              rounded-xl
              border
              border-warm-stone/40
              bg-white
              text-sm
              text-espresso
              outline-none
              focus:border-bronze
            "
          >
            <option value="all">
              All content
            </option>

            <option value="users">
              Users
            </option>

            <option value="hotels">
              Hotels
            </option>

            <option value="reviews">
              Reviews
            </option>
          </select>

          <select
            defaultValue="all"
            className="
              h-11
              px-4
              rounded-xl
              border
              border-warm-stone/40
              bg-white
              text-sm
              text-espresso
              outline-none
              focus:border-bronze
            "
          >
            <option value="all">
              All statuses
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="reviewing">
              Under review
            </option>

            <option value="resolved">
              Resolved
            </option>
          </select>

        </div>
      </div>

      {/* Queue */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.35,
          delay: 0.05,
        }}
        className="
          bg-white
          border
          border-warm-stone/30
          rounded-2xl
          overflow-hidden
        "
      >

        <div
          className="
            hidden
            lg:grid
            grid-cols-[1fr_1.5fr_2fr_1fr_80px]
            gap-4
            px-6
            py-4
            border-b
            border-warm-stone/30
            bg-cream/30
          "
        >
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Type
          </span>

          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Subject
          </span>

          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Issue
          </span>

          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Status
          </span>

          <span />
        </div>

        {/* Empty state */}
        <div className="px-6 py-20 text-center">

          <div
            className="
              mx-auto
              w-14
              h-14
              rounded-2xl
              bg-bronze/10
              text-bronze
              flex
              items-center
              justify-center
            "
          >
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h2 className="font-serif text-xl font-semibold text-espresso mt-5">
            Moderation queue is empty
          </h2>

          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-6">
            Moderation data will appear here when the
            corresponding backend functionality is connected.
          </p>

        </div>

      </motion.div>

      {/* Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        <ModerationCard
          icon={UserRound}
          title="Users"
          description="Review reported or problematic user accounts."
        />

        <ModerationCard
          icon={Hotel}
          title="Hotels"
          description="Review properties requiring administrative attention."
        />

        <ModerationCard
          icon={MessageSquareWarning}
          title="Reviews"
          description="Handle reviews that require moderation."
        />

        <ModerationCard
          icon={Flag}
          title="Reports"
          description="Investigate reports submitted through the platform."
        />

      </div>

      {/* Safety notice */}
      <div
        className="
          flex
          items-start
          gap-4
          p-5
          rounded-2xl
          border
          border-amber-200
          bg-amber-50/60
        "
      >

        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />

        <div>
          <h3 className="text-sm font-medium text-amber-900">
            Administrative actions
          </h3>

          <p className="text-xs text-amber-800/80 mt-1 leading-5">
            Destructive moderation actions should only be
            enabled after their corresponding backend
            operations are available.
          </p>
        </div>

      </div>

    </div>
  );
}

interface ModerationCardProps {
  icon: React.ComponentType<{
    className?: string;
  }>;
  title: string;
  description: string;
}

function ModerationCard({
  icon: Icon,
  title,
  description,
}: ModerationCardProps) {
  return (
    <div
      className="
        bg-white
        border
        border-warm-stone/30
        rounded-2xl
        p-5
      "
    >
      <div
        className="
          w-10
          h-10
          rounded-xl
          bg-bronze/10
          text-bronze
          flex
          items-center
          justify-center
        "
      >
        <Icon className="w-5 h-5" />
      </div>

      <h3 className="font-serif text-lg font-semibold text-espresso mt-4">
        {title}
      </h3>

      <p className="text-xs text-muted-foreground mt-1 leading-5">
        {description}
      </p>
    </div>
  );
}