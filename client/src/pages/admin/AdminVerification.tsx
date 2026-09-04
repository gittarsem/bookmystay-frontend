import { useEffect, useState } from "react";
import {
  Check,
  X,
  RefreshCw,
  ShieldCheck,
  Clock3,
  Building2,
  Phone,
  MapPin,
  CreditCard,
  ExternalLink,
  FileImage,
} from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "@/layouts/DashboardLayout";
import {
  adminApi,
  type OwnerVerification,
} from "@/api/admin";

export default function AdminVerification() {
  const [applications, setApplications] =
    useState<OwnerVerification[]>([]);

  const [selected, setSelected] =
    useState<OwnerVerification | null>(null);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [rejecting, setRejecting] =
    useState(false);

  const [reason, setReason] = useState("");

  const loadApplications = async () => {
    try {
      setLoading(true);

      const response =
        await adminApi.getPendingVerifications();

      const applications =
        response ?? [];

      setApplications(applications);

      setSelected((current) => {
        if (!current) {
          return applications[0] ?? null;
        }

        return (
          applications.find(
            (item) =>
              item.id === current.id,
          ) ?? null
        );
      });
    } catch (error) {
      console.error(
        "Failed to load verification applications",
        error,
      );

      setApplications([]);
      setSelected(null);

      toast.error(
        "Unable to load verification applications",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  // =========================================================
  // APPROVE
  // =========================================================

  const handleApprove = async () => {
    if (!selected) {
      return;
    }

    try {
      setActionLoading(true);

      await adminApi.approveVerification(
        selected.id,
      );

      toast.success(
        "Owner application approved",
      );

      setApplications((current) =>
        current.filter(
          (item) =>
            item.id !== selected.id,
        ),
      );

      setSelected(null);
    } catch (error) {
      console.error(
        "Failed to approve application",
        error,
      );

      toast.error(
        "Unable to approve application",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // REJECT
  // =========================================================

  const handleReject = async () => {
    if (!selected) {
      return;
    }

    const trimmed =
      reason.trim();

    if (!trimmed) {
      toast.error(
        "Rejection reason is required",
      );
      return;
    }

    if (trimmed.length > 500) {
      toast.error(
        "Reason cannot exceed 500 characters",
      );
      return;
    }

    try {
      setActionLoading(true);

      await adminApi.rejectVerification(
        selected.id,
        trimmed,
      );

      toast.success(
        "Owner application rejected",
      );

      setApplications((current) =>
        current.filter(
          (item) =>
            item.id !== selected.id,
        ),
      );

      setSelected(null);
      setRejecting(false);
      setReason("");
    } catch (error) {
      console.error(
        "Failed to reject application",
        error,
      );

      toast.error(
        "Unable to reject application",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Administration
            </p>

            <h1 className="mt-2 font-serif text-3xl font-semibold text-espresso">
              Owner verification
            </h1>

            <p className="mt-2 text-sm text-espresso/60">
              Review applications before granting
              owner access.
            </p>
          </div>

          <button
            type="button"
            onClick={loadApplications}
            disabled={loading}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-warm-stone/40
              bg-white
              px-4
              py-2.5
              text-sm
              text-espresso
              hover:bg-cream
              disabled:opacity-50
            "
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>
        </div>

        {/* =================================================
            CONTENT
        ================================================== */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">

          {/* =================================================
              APPLICATION LIST
          ================================================== */}

          <div className="overflow-hidden rounded-2xl border border-warm-stone/30 bg-white">

            <div className="border-b border-warm-stone/30 px-5 py-4">
              <p className="text-sm font-medium text-espresso">
                Pending applications
              </p>

              <p className="mt-1 text-xs text-espresso/50">
                {applications.length} awaiting review
              </p>
            </div>

            <div className="max-h-[700px] overflow-y-auto">

              {loading && (
                <div className="px-5 py-12 text-center text-sm text-espresso/50">
                  Loading applications...
                </div>
              )}

              {!loading &&
                applications.length === 0 && (
                  <div className="px-5 py-12 text-center">
                    <ShieldCheck className="mx-auto h-8 w-8 text-espresso/20" />

                    <p className="mt-3 text-sm font-medium text-espresso">
                      No pending applications
                    </p>

                    <p className="mt-1 text-xs text-espresso/50">
                      Everything is up to date.
                    </p>
                  </div>
                )}

              {!loading &&
                applications.map(
                  (application) => {
                    const active =
                      selected?.id ===
                      application.id;

                    return (
                      <button
                        key={application.id}
                        type="button"
                        onClick={() =>
                          setSelected(
                            application,
                          )
                        }
                        className={`
                          w-full
                          border-b
                          border-warm-stone/20
                          px-5
                          py-4
                          text-left
                          transition-colors
                          ${
                            active
                              ? "bg-bronze/10"
                              : "hover:bg-cream/60"
                          }
                        `}
                      >
                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">
                            <p className="truncate font-medium text-espresso">
                              {application.applicantName ||
                                "Unnamed applicant"}
                            </p>

                            <p className="mt-1 truncate text-xs text-espresso/50">
                              {application.applicantEmail ||
                                "—"}
                            </p>
                          </div>

                          <Clock3 className="h-4 w-4 shrink-0 text-espresso/30" />
                        </div>

                        <p className="mt-3 text-xs text-espresso/50">
                          Submitted{" "}
                          {application.submittedAt
                            ? new Date(
                                application.submittedAt,
                              ).toLocaleDateString()
                            : "—"}
                        </p>
                      </button>
                    );
                  },
                )}
            </div>
          </div>

          {/* =================================================
              DETAILS
          ================================================== */}

          <div className="rounded-2xl border border-warm-stone/30 bg-white">

            {!selected ? (
              <div className="flex min-h-[500px] items-center justify-center px-6 text-center">
                <div>
                  <ShieldCheck className="mx-auto h-10 w-10 text-espresso/15" />

                  <p className="mt-4 font-medium text-espresso">
                    Select an application
                  </p>

                  <p className="mt-1 text-sm text-espresso/50">
                    Applicant details will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-7 p-6">

                {/* =================================================
                    APPLICANT
                ================================================== */}

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Applicant
                  </p>

                  <h2 className="mt-2 font-serif text-2xl font-semibold text-espresso">
                    {selected.applicantName ||
                      "Unnamed applicant"}
                  </h2>

                  <p className="mt-1 text-sm text-espresso/60">
                    {selected.applicantEmail ||
                      "—"}
                  </p>
                </div>

                {/* =================================================
                    BASIC DETAILS
                ================================================== */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  <Detail
                    icon={Building2}
                    label="Business"
                    value={
                      selected.businessName
                    }
                  />

                  <Detail
                    icon={Phone}
                    label="Phone"
                    value={
                      selected.phoneNumber
                    }
                  />

                  <Detail
                    icon={MapPin}
                    label="Business address"
                    value={
                      selected.businessAddress
                    }
                  />

                  <Detail
                    icon={CreditCard}
                    label="Government ID"
                    value={
                      selected.governmentIdType &&
                      selected.governmentIdNumber
                        ? `${selected.governmentIdType} • ${selected.governmentIdNumber}`
                        : selected.governmentIdType ||
                          selected.governmentIdNumber ||
                          null
                    }
                  />
                </div>

                {/* =================================================
                    GOVERNMENT DOCUMENTS
                ================================================== */}

                <div className="space-y-4">

                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Identity documents
                    </p>

                    <p className="mt-1 text-sm text-espresso/60">
                      Review both sides of the submitted
                      government identification.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                    {/* =================================================
                        FRONT
                    ================================================== */}

                    <DocumentCard
                      label="Front"
                      imageUrl={
                        selected.govtIdFront
                      }
                      alt="Government ID front"
                    />

                    {/* =================================================
                        BACK
                    ================================================== */}

                    <DocumentCard
                      label="Back"
                      imageUrl={
                        selected.govtIdBack
                      }
                      alt="Government ID back"
                    />

                  </div>
                </div>

                {/* =================================================
                    SUBMITTED
                ================================================== */}

                <div className="rounded-xl bg-cream/60 p-4">
                  <p className="text-xs text-espresso/50">
                    Submitted
                  </p>

                  <p className="mt-1 text-sm text-espresso">
                    {selected.submittedAt
                      ? new Date(
                          selected.submittedAt,
                        ).toLocaleString()
                      : "—"}
                  </p>
                </div>

                {/* =================================================
                    REJECT FORM
                ================================================== */}

                {rejecting && (
                  <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">

                    <label className="text-sm font-medium text-espresso">
                      Rejection reason
                    </label>

                    <textarea
                      value={reason}
                      onChange={(event) =>
                        setReason(
                          event.target.value,
                        )
                      }
                      maxLength={500}
                      rows={4}
                      placeholder="Explain why this application is being rejected..."
                      className="
                        mt-2
                        w-full
                        resize-none
                        rounded-lg
                        border
                        border-warm-stone/40
                        bg-white
                        p-3
                        text-sm
                        text-espresso
                        outline-none
                        focus:border-red-400
                      "
                    />

                    <div className="mt-1 text-right text-xs text-espresso/40">
                      {reason.length}/500
                    </div>

                    <div className="mt-3 flex justify-end gap-2">

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => {
                          setRejecting(false);
                          setReason("");
                        }}
                        className="
                          rounded-lg
                          border
                          border-warm-stone/40
                          bg-white
                          px-4
                          py-2
                          text-sm
                          text-espresso
                          hover:bg-cream
                          disabled:opacity-50
                        "
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleReject}
                        disabled={actionLoading}
                        className="
                          rounded-lg
                          bg-red-600
                          px-4
                          py-2
                          text-sm
                          font-medium
                          text-white
                          disabled:opacity-50
                        "
                      >
                        {actionLoading
                          ? "Rejecting..."
                          : "Confirm rejection"}
                      </button>

                    </div>
                  </div>
                )}

                {/* =================================================
                    ACTIONS
                ================================================== */}

                {!rejecting && (
                  <div className="flex flex-col justify-end gap-3 border-t border-warm-stone/30 pt-5 sm:flex-row">

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() =>
                        setRejecting(true)
                      }
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        border
                        border-red-200
                        px-5
                        py-2.5
                        text-sm
                        font-medium
                        text-red-600
                        hover:bg-red-50
                        disabled:opacity-50
                      "
                    >
                      <X className="h-4 w-4" />

                      Reject
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleApprove}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        bg-bronze
                        px-5
                        py-2.5
                        text-sm
                        font-medium
                        text-white
                        hover:bg-bronze/90
                        disabled:opacity-50
                      "
                    >
                      <Check className="h-4 w-4" />

                      {actionLoading
                        ? "Processing..."
                        : "Approve"}
                    </button>

                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


// =============================================================
// DETAIL COMPONENT
// =============================================================

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-xl border border-warm-stone/30 p-4">

      <div className="flex items-center gap-2 text-espresso/50">
        <Icon className="h-4 w-4" />

        <span className="text-xs">
          {label}
        </span>
      </div>

      <p className="mt-2 break-words text-sm text-espresso">
        {value || "—"}
      </p>

    </div>
  );
}


// =============================================================
// DOCUMENT CARD
// =============================================================

function DocumentCard({
  label,
  imageUrl,
  alt,
}: {
  label: string;
  imageUrl?: string | null;
  alt: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-warm-stone/30 bg-cream/20">

      {/* HEADER */}

      <div className="flex items-center justify-between border-b border-warm-stone/30 bg-white px-4 py-3">

        <div className="flex items-center gap-2">
          <FileImage className="h-4 w-4 text-espresso/50" />

          <p className="text-sm font-medium text-espresso">
            {label}
          </p>
        </div>

        {imageUrl && (
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="
              inline-flex
              items-center
              gap-1.5
              text-xs
              font-medium
              text-bronze
              hover:underline
            "
          >
            Open
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

      </div>

      {/* IMAGE */}

      {imageUrl ? (
        <div className="flex min-h-[260px] items-center justify-center bg-cream/30 p-3">

          <img
            src={imageUrl}
            alt={alt}
            loading="lazy"
            className="
              max-h-[420px]
              w-full
              rounded-lg
              object-contain
            "
            onError={(event) => {
              event.currentTarget.style.display =
                "none";
            }}
          />

        </div>
      ) : (
        <div className="flex min-h-[260px] flex-col items-center justify-center px-5 text-center">

          <FileImage className="h-9 w-9 text-espresso/15" />

          <p className="mt-3 text-sm font-medium text-espresso/60">
            Document unavailable
          </p>

          <p className="mt-1 text-xs text-espresso/40">
            No {label.toLowerCase()} document
            was provided.
          </p>

        </div>
      )}

    </div>
  );
}