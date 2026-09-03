import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  Compass,
  FileCheck2,
  RefreshCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  ownerVerificationApi,
  type OwnerVerificationResponse,
  type VerificationStatus,
} from "@/api/ownerVerification";

const governmentIdLabels: Record<
  string,
  string
> = {
  AADHAAR: "Aadhaar",
  PASSPORT: "Passport",
  DRIVING_LICENSE: "Driving License",
  VOTER_ID: "Voter ID",
};

function formatDate(date: string) {
  const parsed = new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return date;
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function getStatusContent(
  status: VerificationStatus
) {
  switch (status) {
    case "APPROVED":
      return {
        icon: CheckCircle2,
        label: "Approved",
        title: "You're approved.",
        description:
          "Your BookMyStay partner application has been approved. You can now start listing and managing your properties.",
      };

    case "REJECTED":
      return {
        icon: XCircle,
        label: "Rejected",
        title:
          "Your application needs attention.",
        description:
          "Your owner verification application was not approved. Review your information and resubmit your application.",
      };

    case "PENDING":
    default:
      return {
        icon: Clock3,
        label: "Under review",
        title:
          "Your application is under review.",
        description:
          "We've received your application. Our team is reviewing the information you provided.",
      };
  }
}

export default function OwnerVerification() {
  const [, setLocation] =
    useLocation();

  const [
    verification,
    setVerification,
  ] =
    useState<OwnerVerificationResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  const loadVerification =
    async () => {
      setLoading(true);
      setError(false);

      try {
        const response =
          await ownerVerificationApi.getMyVerification();

        setVerification(
          response.data
        );
      } catch (err: any) {
        setError(true);

        const status =
          err?.response?.status;

        if (status !== 404) {
          toast.error(
            err?.response?.data
              ?.message ||
              "Unable to load your verification status."
          );
        }
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadVerification();
  }, []);

  const statusContent =
    useMemo(() => {
      if (!verification) {
        return null;
      }

      return getStatusContent(
        verification.verificationStatus
      );
    }, [verification]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">

        <VerificationHeader />

        <main className="max-w-5xl mx-auto px-5 md:px-8 py-12 md:py-20">

          <div className="animate-pulse">

            <div className="h-4 w-32 bg-warm-stone/20 rounded mb-5" />

            <div className="h-12 w-2/3 bg-warm-stone/20 rounded mb-4" />

            <div className="h-5 w-full max-w-xl bg-warm-stone/20 rounded mb-12" />

            <div className="h-64 bg-white border border-warm-stone/20 rounded-2xl" />

          </div>

        </main>

      </div>
    );
  }

  if (
    error ||
    !verification
  ) {
    return (
      <div className="min-h-screen bg-cream">

        <VerificationHeader />

        <main className="max-w-5xl mx-auto px-5 md:px-8 py-12 md:py-20">

          <div className="max-w-xl mx-auto text-center">

            <div className="w-14 h-14 rounded-full bg-bronze/10 flex items-center justify-center mx-auto mb-6">
              <FileCheck2 className="w-6 h-6 text-bronze" />
            </div>

            <h1 className="font-serif text-3xl font-semibold text-espresso">
              No application found
            </h1>

            <p className="mt-3 text-muted-foreground leading-relaxed">
              We couldn't find an owner verification application
              associated with your account.
            </p>

            <button
              type="button"
              onClick={() =>
                setLocation(
                  "/owner/apply"
                )
              }
              className="mt-7 inline-flex items-center gap-2 px-5 py-3 bg-bronze hover:bg-bronze-dark text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Start Application

              <ArrowRight className="w-4 h-4" />

            </button>

          </div>

        </main>

      </div>
    );
  }

  const StatusIcon =
    statusContent!.icon;

  return (
    <div className="min-h-screen bg-cream">

      <VerificationHeader />

      <main className="max-w-5xl mx-auto px-5 md:px-8 py-10 md:py-16">

        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
          }}
          className="max-w-3xl"
        >

          <p className="text-xs uppercase tracking-[0.2em] text-bronze font-semibold">
            Partner verification
          </p>

          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-espresso leading-tight mt-3">
            Verification status
          </h1>

          <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed">
            Track the status of your BookMyStay partner application.
          </p>

        </motion.div>


        {/* =====================================================
            STATUS CARD
        ====================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.1,
          }}
          className="mt-10 bg-white border border-warm-stone/20 rounded-2xl overflow-hidden shadow-warm"
        >

          <div className="p-6 md:p-8 lg:p-10">

            <div className="flex flex-col sm:flex-row sm:items-start gap-5">

              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
                  verification.verificationStatus ===
                  "APPROVED"
                    ? "bg-sage/15"
                    : verification.verificationStatus ===
                        "REJECTED"
                      ? "bg-red-50"
                      : "bg-bronze/10"
                }`}
              >

                <StatusIcon
                  className={`w-7 h-7 ${
                    verification.verificationStatus ===
                    "APPROVED"
                      ? "text-sage"
                      : verification.verificationStatus ===
                          "REJECTED"
                        ? "text-red-500"
                        : "text-bronze"
                  }`}
                />

              </div>


              <div className="flex-1">

                <div className="flex flex-wrap items-center gap-3">

                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      verification.verificationStatus ===
                      "APPROVED"
                        ? "bg-sage/10 text-sage"
                        : verification.verificationStatus ===
                            "REJECTED"
                          ? "bg-red-50 text-red-600"
                          : "bg-bronze/10 text-bronze"
                    }`}
                  >
                    {statusContent!.label}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    Submitted{" "}
                    {formatDate(
                      verification.submittedAt
                    )}
                  </span>

                </div>


                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-espresso mt-4">
                  {statusContent!.title}
                </h2>

                <p className="mt-3 max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
                  {statusContent!.description}
                </p>


                {verification.verificationStatus ===
                  "APPROVED" && (
                  <button
                    type="button"
                    onClick={() =>
                      setLocation(
                        "/owner"
                      )
                    }
                    className="mt-7 inline-flex items-center gap-2 px-5 py-3 bg-bronze hover:bg-bronze-dark text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    Go to Owner Dashboard

                    <ArrowRight className="w-4 h-4" />

                  </button>
                )}


                {verification.verificationStatus ===
                  "REJECTED" &&
                  verification.rejectionReason && (
                    <>
                      <div className="mt-6 rounded-xl border border-red-200 bg-red-50/60 p-4">

                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-600">
                          Reason for rejection
                        </p>

                        <p className="mt-2 text-sm leading-relaxed text-red-900">
                          {
                            verification.rejectionReason
                          }
                        </p>

                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          setLocation(
                            "/owner/verification/resubmit"
                          )
                        }
                        className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-bronze hover:bg-bronze-dark text-white rounded-xl text-sm font-semibold transition-colors"
                      >
                        Review & Resubmit

                        <ArrowRight className="w-4 h-4" />

                      </button>
                    </>
                  )}

              </div>

            </div>

          </div>


          {/* =====================================================
              PROGRESS
          ====================================================== */}

          <div className="border-t border-warm-stone/20 bg-cream/30 px-6 md:px-8 lg:px-10 py-7">

            <div className="max-w-3xl">

              <div className="flex items-center">

                <VerificationStep
                  number="01"
                  title="Application submitted"
                  completed
                />

                <div className="flex-1 h-px bg-warm-stone/30 mx-3 md:mx-5" />

                <VerificationStep
                  number="02"
                  title="Under review"
                  completed={
                    verification.verificationStatus ===
                      "PENDING" ||
                    verification.verificationStatus ===
                      "APPROVED"
                  }
                  active={
                    verification.verificationStatus ===
                    "PENDING"
                  }
                />

                <div className="flex-1 h-px bg-warm-stone/30 mx-3 md:mx-5" />

                <VerificationStep
                  number="03"
                  title={
                    verification.verificationStatus ===
                    "REJECTED"
                      ? "Changes required"
                      : "Approved"
                  }
                  completed={
                    verification.verificationStatus ===
                    "APPROVED"
                  }
                  active={
                    verification.verificationStatus ===
                    "REJECTED"
                  }
                  rejected={
                    verification.verificationStatus ===
                    "REJECTED"
                  }
                />

              </div>

            </div>

          </div>

        </motion.section>


        {/* =====================================================
            APPLICATION DETAILS
        ====================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.2,
          }}
          className="mt-8 bg-white border border-warm-stone/20 rounded-2xl overflow-hidden"
        >

          <div className="px-6 md:px-8 py-5 border-b border-warm-stone/20">

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-lg bg-bronze/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-bronze" />
              </div>

              <div>

                <h2 className="font-medium text-espresso">
                  Application details
                </h2>

                <p className="text-xs text-muted-foreground mt-1">
                  Information submitted with your application
                </p>

              </div>

            </div>

          </div>


          <div className="p-6 md:p-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">

              <Detail
                label="Applicant"
                value={
                  verification.applicantName
                }
              />

              <Detail
                label="Email"
                value={
                  verification.applicantEmail
                }
              />

              <Detail
                label="Business name"
                value={
                  verification.businessName
                }
              />

              <Detail
                label="Phone number"
                value={
                  verification.phoneNumber
                }
              />

              <Detail
                label="Government ID"
                value={
                  governmentIdLabels[
                    verification
                      .governmentIdType
                  ] ||
                  verification
                    .governmentIdType
                }
              />

              <Detail
                label="Government ID number"
                value={
                  verification.governmentIdNumber
                }
              />

              <div className="md:col-span-2">

                <Detail
                  label="Business address"
                  value={
                    verification.businessAddress
                  }
                />

              </div>

            </div>

          </div>

        </motion.section>


        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">

          <div className="flex items-center gap-3 text-sm text-muted-foreground">

            <ShieldCheck className="w-4 h-4 text-bronze shrink-0" />

            <span>
              Your application information is securely handled.
            </span>

          </div>


          <button
            type="button"
            onClick={loadVerification}
            className="inline-flex items-center gap-2 text-sm text-espresso/70 hover:text-espresso transition-colors"
          >

            <RefreshCcw className="w-4 h-4" />

            Refresh status

          </button>

        </div>

      </main>

    </div>
  );
}


/* =========================================================
   HEADER
========================================================= */

function VerificationHeader() {
  return (
    <header className="border-b border-warm-stone/20 bg-white/90 backdrop-blur-xl">

      <div className="max-w-7xl mx-auto h-20 px-5 md:px-8 flex items-center justify-between">

        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">

            <Compass className="w-7 h-7 text-bronze" />

            <span className="font-serif text-xl font-bold text-espresso">
              BookMyStay
            </span>

          </div>
        </Link>


        <Link href="/list-property">

          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm text-espresso/65 hover:text-espresso transition-colors"
          >

            <ArrowLeft className="w-4 h-4" />

            Back

          </button>

        </Link>

      </div>

    </header>
  );
}


/* =========================================================
   VERIFICATION STEP
========================================================= */

function VerificationStep({
  number,
  title,
  completed,
  active,
  rejected,
}: {
  number: string;
  title: string;
  completed?: boolean;
  active?: boolean;
  rejected?: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center min-w-0">

      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${
          rejected
            ? "bg-red-50 text-red-500"
            : completed
              ? "bg-bronze text-white"
              : active
                ? "border-2 border-bronze text-bronze bg-white"
                : "border border-warm-stone/40 text-muted-foreground bg-white"
        }`}
      >

        {completed &&
        !rejected ? (
          <Check className="w-4 h-4" />
        ) : (
          number
        )}

      </div>


      <span
        className={`mt-2 text-[11px] md:text-xs whitespace-nowrap ${
          completed ||
          active ||
          rejected
            ? "text-espresso font-medium"
            : "text-muted-foreground"
        }`}
      >
        {title}
      </span>

    </div>
  );
}


/* =========================================================
   DETAIL
========================================================= */

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
        {label}
      </p>

      <p className="mt-2 text-sm text-espresso break-words">
        {value}
      </p>

    </div>
  );
}