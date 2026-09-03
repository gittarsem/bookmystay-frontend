import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Compass,
  FileCheck2,
  FileImage,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  ownerVerificationApi,
  type GovernmentIdType,
  type OwnerVerificationResponse,
} from "@/api/ownerVerification";

const governmentIds: {
  value: GovernmentIdType;
  label: string;
}[] = [
  {
    value: "AADHAAR",
    label: "Aadhaar",
  },
  {
    value: "PASSPORT",
    label: "Passport",
  },
  {
    value: "DRIVING_LICENSE",
    label: "Driving License",
  },
  {
    value: "VOTER_ID",
    label: "Voter ID",
  },
];

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

type FormErrors = {
  businessName?: string;
  governmentIdNumber?: string;
  phoneNumber?: string;
  businessAddress?: string;
  governmentIdFront?: string;
  governmentIdBack?: string;
};

export default function OwnerVerificationResubmit() {
  const [, setLocation] =
    useLocation();

  const [
    verification,
    setVerification,
  ] =
    useState<OwnerVerificationResponse | null>(
      null
    );

  const [businessName, setBusinessName] =
    useState("");

  const [
    governmentIdType,
    setGovernmentIdType,
  ] =
    useState<GovernmentIdType>(
      "AADHAAR"
    );

  const [
    governmentIdNumber,
    setGovernmentIdNumber,
  ] =
    useState("");

  const [phoneNumber, setPhoneNumber] =
    useState("");

  const [
    businessAddress,
    setBusinessAddress,
  ] =
    useState("");

  const [
    governmentIdFront,
    setGovernmentIdFront,
  ] =
    useState<File | null>(null);

  const [
    governmentIdBack,
    setGovernmentIdBack,
  ] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [errors, setErrors] =
    useState<FormErrors>({});


  /* =====================================================
     LOAD EXISTING APPLICATION
  ====================================================== */

  useEffect(() => {
    const loadVerification =
      async () => {
        try {
          const response =
            await ownerVerificationApi.getMyVerification();

          const data =
            response.data;

          setVerification(data);

          setBusinessName(
            data.businessName || ""
          );

          setGovernmentIdType(
            data.governmentIdType
          );

          setGovernmentIdNumber(
            data.governmentIdNumber || ""
          );

          setPhoneNumber(
            data.phoneNumber || ""
          );

          setBusinessAddress(
            data.businessAddress || ""
          );
        } catch (error: any) {
          toast.error(
            error?.response?.data
              ?.message ||
              "Unable to load your application."
          );

          setLocation(
            "/owner/verification"
          );
        } finally {
          setLoading(false);
        }
      };

    loadVerification();
  }, [setLocation]);


  /* =====================================================
     VALIDATION
  ====================================================== */

  const validate = () => {
    const nextErrors: FormErrors =
      {};

    if (!businessName.trim()) {
      nextErrors.businessName =
        "Business name is required";
    }

    if (!governmentIdNumber.trim()) {
      nextErrors.governmentIdNumber =
        "Government ID number is required";
    }

    if (!phoneNumber.trim()) {
      nextErrors.phoneNumber =
        "Phone number is required";
    } else if (
      !/^[6-9]\d{9}$/.test(
        phoneNumber
      )
    ) {
      nextErrors.phoneNumber =
        "Enter a valid 10-digit phone number";
    }

    if (!businessAddress.trim()) {
      nextErrors.businessAddress =
        "Business address is required";
    }

    if (!governmentIdFront) {
      nextErrors.governmentIdFront =
        "Front document is required";
    }

    if (!governmentIdBack) {
      nextErrors.governmentIdBack =
        "Back document is required";
    }

    setErrors(nextErrors);

    return Object.values(
      nextErrors
    ).every(
      (error) => !error
    );
  };


  /* =====================================================
     DOCUMENT CHANGE
  ====================================================== */

  const handleDocumentChange = (
    file: File | undefined,
    side: "front" | "back"
  ) => {
    if (!file) {
      return;
    }

    if (
      !ALLOWED_FILE_TYPES.includes(
        file.type
      )
    ) {
      toast.error(
        "Please upload a JPG, PNG, WEBP or PDF file."
      );

      return;
    }

    if (
      file.size > MAX_FILE_SIZE
    ) {
      toast.error(
        "Document must be smaller than 10 MB."
      );

      return;
    }

    if (side === "front") {
      setGovernmentIdFront(file);

      setErrors((current) => ({
        ...current,
        governmentIdFront:
          undefined,
      }));
    } else {
      setGovernmentIdBack(file);

      setErrors((current) => ({
        ...current,
        governmentIdBack:
          undefined,
      }));
    }
  };


  /* =====================================================
     SUBMIT
  ====================================================== */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    if (
      !governmentIdFront ||
      !governmentIdBack
    ) {
      return;
    }

    setSubmitting(true);

    try {
      await ownerVerificationApi.resubmit(
        {
          businessName:
            businessName.trim(),

          businessAddress:
            businessAddress.trim(),

          phoneNumber:
            phoneNumber.trim(),

          governmentIdType,

          governmentIdNumber:
            governmentIdNumber.trim(),

          governmentIdFront,

          governmentIdBack,
        }
      );

      toast.success(
        "Verification application resubmitted successfully"
      );

      setLocation(
        "/owner/verification"
      );
    } catch (error: any) {
      const message =
        error?.response?.data
          ?.message ||
        error?.response?.data ||
        "Unable to resubmit your application.";

      toast.error(
        typeof message === "string"
          ? message
          : "Unable to resubmit your application."
      );
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-cream">

        <Header />

        <main className="max-w-5xl mx-auto px-5 md:px-8 py-12 md:py-20">

          <div className="animate-pulse space-y-5">

            <div className="h-4 w-36 bg-warm-stone/20 rounded" />

            <div className="h-12 w-2/3 bg-warm-stone/20 rounded" />

            <div className="h-5 w-2/3 bg-warm-stone/20 rounded" />

            <div className="h-[620px] bg-white border border-warm-stone/20 rounded-2xl mt-10" />

          </div>

        </main>

      </div>
    );
  }

  if (!verification) {
    return null;
  }


  return (
    <div className="min-h-screen bg-cream">

      <Header />

      <main className="max-w-5xl mx-auto px-5 md:px-8 py-10 md:py-16">

        {/* =====================================================
            HEADING
        ====================================================== */}

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
            duration: 0.4,
          }}
          className="max-w-3xl"
        >

          <p className="text-xs uppercase tracking-[0.2em] text-bronze font-semibold">
            Verification
          </p>

          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-espresso mt-3">
            Review your application.
          </h1>

          <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed">
            Update the requested information and upload your
            documents again before resubmitting.
          </p>

        </motion.div>


        {/* =====================================================
            REJECTION
        ====================================================== */}

        {verification.rejectionReason && (
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-5 md:p-6"
          >

            <div className="flex items-start gap-4">

              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-600" />
              </div>

              <div>

                <p className="text-xs uppercase tracking-[0.15em] font-semibold text-red-600">
                  Reason for rejection
                </p>

                <p className="mt-2 text-sm md:text-base leading-relaxed text-red-950">
                  {
                    verification.rejectionReason
                  }
                </p>

              </div>

            </div>

          </motion.div>
        )}


        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 mt-8">

          <motion.form
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
              delay: 0.08,
            }}
            onSubmit={handleSubmit}
            noValidate
            className="bg-white border border-warm-stone/20 rounded-2xl overflow-hidden shadow-warm"
          >

            <div className="px-6 md:px-8 py-6 border-b border-warm-stone/20">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-bronze/10 flex items-center justify-center">

                  <FileCheck2 className="w-4 h-4 text-bronze" />

                </div>

                <div>

                  <h2 className="font-serif text-2xl font-semibold text-espresso">
                    Update application
                  </h2>

                  <p className="text-xs text-muted-foreground mt-1">
                    Update your information and documents.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-6 md:p-8 space-y-8">

              {/* BUSINESS */}

              <section>

                <div className="flex items-center gap-3 mb-5">

                  <Building2 className="w-4 h-4 text-bronze" />

                  <h3 className="text-sm font-semibold text-espresso">
                    Business information
                  </h3>

                </div>

                <Field
                  label="Business name"
                  required
                  error={
                    errors.businessName
                  }
                >

                  <input
                    value={businessName}
                    onChange={(event) => {

                      setBusinessName(
                        event.target.value
                      );

                      setErrors((current) => ({
                        ...current,
                        businessName:
                          undefined,
                      }));

                    }}
                    className={inputClass(
                      !!errors.businessName
                    )}
                  />

                </Field>

              </section>


              <div className="h-px bg-warm-stone/15" />


              {/* IDENTITY */}

              <section>

                <div className="flex items-start gap-3 mb-5">

                  <div className="w-9 h-9 rounded-lg bg-bronze/10 flex items-center justify-center">

                    <FileCheck2 className="w-4 h-4 text-bronze" />

                  </div>

                  <div>

                    <h3 className="font-medium text-espresso">
                      Identity information
                    </h3>

                    <p className="text-xs text-muted-foreground mt-1">
                      Upload both sides of your government-issued ID.
                    </p>

                  </div>

                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <Field
                    label="Government ID type"
                    required
                  >

                    <select
                      value={
                        governmentIdType
                      }
                      onChange={(event) =>
                        setGovernmentIdType(
                          event.target
                            .value as GovernmentIdType
                        )
                      }
                      className={inputClass(
                        false
                      )}
                    >

                      {governmentIds.map(
                        (item) => (
                          <option
                            key={
                              item.value
                            }
                            value={
                              item.value
                            }
                          >
                            {item.label}
                          </option>
                        )
                      )}

                    </select>

                  </Field>


                  <Field
                    label="Government ID number"
                    required
                    error={
                      errors.governmentIdNumber
                    }
                  >

                    <input
                      value={
                        governmentIdNumber
                      }
                      onChange={(event) => {

                        setGovernmentIdNumber(
                          event.target.value
                        );

                        setErrors((current) => ({
                          ...current,
                          governmentIdNumber:
                            undefined,
                        }));

                      }}
                      className={inputClass(
                        !!errors.governmentIdNumber
                      )}
                    />

                  </Field>

                </div>


                <div className="mt-5 p-4 rounded-xl bg-cream/60 border border-warm-stone/15">

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Please upload the documents again for
                    this resubmission. The files will be sent
                    securely to BookMyStay and processed by
                    the server.
                  </p>

                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

                  <DocumentUpload
                    label="Government ID — Front"
                    file={
                      governmentIdFront
                    }
                    error={
                      errors.governmentIdFront
                    }
                    onChange={(file) =>
                      handleDocumentChange(
                        file,
                        "front"
                      )
                    }
                    onRemove={() =>
                      setGovernmentIdFront(
                        null
                      )
                    }
                  />


                  <DocumentUpload
                    label="Government ID — Back"
                    file={
                      governmentIdBack
                    }
                    error={
                      errors.governmentIdBack
                    }
                    onChange={(file) =>
                      handleDocumentChange(
                        file,
                        "back"
                      )
                    }
                    onRemove={() =>
                      setGovernmentIdBack(
                        null
                      )
                    }
                  />

                </div>

              </section>


              <div className="h-px bg-warm-stone/15" />


              {/* CONTACT */}

              <section>

                <div className="flex items-center gap-3 mb-5">

                  <Phone className="w-4 h-4 text-bronze" />

                  <h3 className="text-sm font-semibold text-espresso">
                    Contact information
                  </h3>

                </div>


                <div className="space-y-5">

                  <Field
                    label="Phone number"
                    required
                    error={
                      errors.phoneNumber
                    }
                  >

                    <div className="relative">

                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        +91
                      </span>

                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={
                          phoneNumber
                        }
                        onChange={(event) => {

                          const value =
                            event.target.value.replace(
                              /\D/g,
                              ""
                            );

                          setPhoneNumber(
                            value
                          );

                          setErrors((current) => ({
                            ...current,
                            phoneNumber:
                              undefined,
                          }));

                        }}
                        className={`${inputClass(
                          !!errors.phoneNumber
                        )} pl-14`}
                      />

                    </div>

                  </Field>


                  <Field
                    label="Business address"
                    required
                    error={
                      errors.businessAddress
                    }
                  >

                    <textarea
                      rows={4}
                      value={
                        businessAddress
                      }
                      onChange={(event) => {

                        setBusinessAddress(
                          event.target.value
                        );

                        setErrors((current) => ({
                          ...current,
                          businessAddress:
                            undefined,
                        }));

                      }}
                      className={`${inputClass(
                        !!errors.businessAddress
                      )} resize-none`}
                    />

                  </Field>

                </div>

              </section>

            </div>


            {/* =================================================
                FOOTER
            ================================================== */}

            <div className="px-6 md:px-8 py-5 bg-cream/40 border-t border-warm-stone/20 flex flex-col sm:flex-row justify-between items-center gap-4">

              <button
                type="button"
                onClick={() =>
                  setLocation(
                    "/owner/verification"
                  )
                }
                className="inline-flex items-center gap-2 text-sm text-espresso/65 hover:text-espresso transition-colors"
              >

                <ArrowLeft className="w-4 h-4" />

                Cancel

              </button>


              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-bronze hover:bg-bronze-dark text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >

                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                    Resubmitting...
                  </>
                ) : (
                  <>
                    Resubmit Application

                    <ArrowRight className="w-4 h-4" />

                  </>
                )}

              </button>

            </div>

          </motion.form>


          {/* SIDEBAR */}

          <aside className="space-y-4">

            <div className="bg-espresso text-white rounded-2xl p-6">

              <ShieldCheck className="w-6 h-6 text-bronze mb-5" />

              <h3 className="font-serif text-xl font-semibold">
                Complete your application
              </h3>

              <p className="mt-3 text-sm text-white/60 leading-relaxed">
                Make sure your information is accurate and
                both sides of your government ID are clear.
              </p>

              <div className="mt-7 space-y-4">

                {[
                  "Review your business information",
                  "Upload the front of your ID",
                  "Upload the back of your ID",
                ].map((item) => (

                  <div
                    key={item}
                    className="flex items-start gap-3"
                  >

                    <div className="w-5 h-5 rounded-full bg-bronze/20 flex items-center justify-center shrink-0">

                      <Check className="w-3 h-3 text-bronze" />

                    </div>

                    <span className="text-sm text-white/75">
                      {item}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </aside>

        </div>

      </main>

    </div>
  );
}


/* =========================================================
   DOCUMENT UPLOAD
========================================================= */

function DocumentUpload({
  label,
  file,
  error,
  onChange,
  onRemove,
}: {
  label: string;
  file: File | null;
  error?: string;
  onChange: (
    file: File | undefined
  ) => void;
  onRemove: () => void;
}) {
  const inputId = label
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    );

  return (
    <div>

      <p className="block text-sm font-medium text-espresso mb-2">

        {label}

        <span className="text-bronze ml-1">
          *
        </span>

      </p>


      {file ? (

        <div className="border border-sage/30 bg-sage/5 rounded-xl p-4">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-lg bg-sage/10 flex items-center justify-center shrink-0">

              <FileImage className="w-5 h-5 text-sage" />

            </div>


            <div className="min-w-0 flex-1">

              <p className="text-sm font-medium text-espresso">
                Document selected
              </p>

              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {file.name}
              </p>

              <p className="text-[11px] text-muted-foreground mt-1">
                {(
                  file.size /
                  (1024 * 1024)
                ).toFixed(2)}{" "}
                MB
              </p>

            </div>


            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${label}`}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
            >

              <X className="w-4 h-4" />

            </button>

          </div>

        </div>

      ) : (

        <label
          htmlFor={inputId}
          className="block border border-dashed border-warm-stone/40 rounded-xl p-5 cursor-pointer bg-cream/20 hover:bg-cream/50 hover:border-bronze/40 transition-all"
        >

          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(event) => {

              onChange(
                event.target.files?.[0]
              );

              event.target.value = "";

            }}
          />


          <div className="flex flex-col items-center text-center">

            <div className="w-10 h-10 rounded-full bg-bronze/10 flex items-center justify-center">

              <Upload className="w-4 h-4 text-bronze" />

            </div>

            <p className="mt-3 text-sm font-medium text-espresso">
              Upload document
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG, WEBP or PDF · Maximum 10 MB
            </p>

          </div>

        </label>

      )}


      {error && (
        <p className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}

    </div>
  );
}


/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>

      <label className="block text-sm font-medium text-espresso mb-2">

        {label}

        {required && (
          <span className="text-bronze ml-1">
            *
          </span>
        )}

      </label>

      {children}

      {error && (
        <p className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}

    </div>
  );
}


/* =========================================================
   INPUT CLASS
========================================================= */

function inputClass(
  error: boolean
) {
  return `w-full px-4 py-3 bg-cream/40 border rounded-xl text-sm text-espresso placeholder:text-muted-foreground/60 outline-none transition-all focus:ring-2 focus:ring-bronze/15 focus:border-bronze/50 ${
    error
      ? "border-red-400"
      : "border-warm-stone/30"
  }`;
}


/* =========================================================
   HEADER
========================================================= */

function Header() {
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


        <Link href="/owner/verification">

          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm text-espresso/65 hover:text-espresso transition-colors"
          >

            <ArrowLeft className="w-4 h-4" />

            Verification

          </button>

        </Link>

      </div>

    </header>
  );
}