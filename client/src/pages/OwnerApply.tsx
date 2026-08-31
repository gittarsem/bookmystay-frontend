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
  MapPin,
  Phone,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  ownerVerificationApi,
  type GovernmentIdType,
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

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

interface FormErrors {
  businessName?: string;
  governmentIdNumber?: string;
  phoneNumber?: string;
  businessAddress?: string;
  governmentIdFront?: string;
  governmentIdBack?: string;
}

export default function OwnerApply() {
  const [, setLocation] = useLocation();

  const [checkingApplication, setCheckingApplication] =
    useState(true);

  const [businessName, setBusinessName] =
    useState("");

  const [governmentIdType, setGovernmentIdType] =
    useState<GovernmentIdType>("AADHAAR");

  const [governmentIdNumber, setGovernmentIdNumber] =
    useState("");

  const [phoneNumber, setPhoneNumber] =
    useState("");

  const [businessAddress, setBusinessAddress] =
    useState("");

  const [governmentIdFront, setGovernmentIdFront] =
    useState<File | null>(null);

  const [governmentIdBack, setGovernmentIdBack] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [errors, setErrors] =
    useState<FormErrors>({});


  /* =========================================================
     CHECK WHETHER APPLICATION ALREADY EXISTS
     ========================================================= */

  useEffect(() => {
    let mounted = true;

    const checkApplication = async () => {
      try {
        const response =
          await ownerVerificationApi.getMyVerification();

        if (!mounted) return;

        const verification = response.data;

        /*
         * The user already has an application.
         * Do not allow another application to be submitted.
         */

        if (
          verification.verificationStatus ===
          "APPROVED"
        ) {
          setLocation("/owner");
          return;
        }

        /*
         * PENDING or REJECTED both have an existing
         * application, so send them to the verification
         * page where the correct next action is displayed.
         */

        setLocation("/owner/verification");

      } catch (error: any) {
        if (!mounted) return;

        const status =
          error?.response?.status;

        /*
         * 404 means there is no application yet.
         * Only then should the application form render.
         */

        if (status === 404) {
          setCheckingApplication(false);
          return;
        }

        toast.error(
          error?.response?.data?.message ||
          "Unable to check your application status."
        );

        setLocation("/list-property");
      }
    };

    checkApplication();

    return () => {
      mounted = false;
    };
  }, [setLocation]);


  /* =========================================================
     FILE VALIDATION
     ========================================================= */

  const validateFile = (
    file: File | null
  ) => {
    if (!file) {
      return "Document is required.";
    }

    if (
      !ALLOWED_FILE_TYPES.includes(
        file.type
      )
    ) {
      return "Use JPG, PNG, WEBP or PDF.";
    }

    if (
      file.size > MAX_FILE_SIZE
    ) {
      return "File must be smaller than 10 MB.";
    }

    return undefined;
  };


  /* =========================================================
     FORM VALIDATION
     ========================================================= */

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!businessName.trim()) {
      nextErrors.businessName =
        "Business name is required.";
    }

    if (!governmentIdNumber.trim()) {
      nextErrors.governmentIdNumber =
        "Government ID number is required.";
    }

    if (!phoneNumber.trim()) {
      nextErrors.phoneNumber =
        "Phone number is required.";
    } else if (
      !/^[6-9]\d{9}$/.test(
        phoneNumber.trim()
      )
    ) {
      nextErrors.phoneNumber =
        "Enter a valid 10-digit Indian phone number.";
    }

    if (!businessAddress.trim()) {
      nextErrors.businessAddress =
        "Business address is required.";
    }

    const frontError =
      validateFile(
        governmentIdFront
      );

    if (frontError) {
      nextErrors.governmentIdFront =
        frontError;
    }

    const backError =
      validateFile(
        governmentIdBack
      );

    if (backError) {
      nextErrors.governmentIdBack =
        backError;
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };


  /* =========================================================
     FILE SELECTION
     ========================================================= */

  const handleFileChange = (
    file: File | undefined,
    side: "front" | "back"
  ) => {
    if (!file) return;

    if (
      !ALLOWED_FILE_TYPES.includes(
        file.type
      )
    ) {
      toast.error(
        "Please upload JPG, PNG, WEBP or PDF."
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


  /* =========================================================
     SUBMIT APPLICATION
     ========================================================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (
      !governmentIdFront ||
      !governmentIdBack
    ) {
      return;
    }

    setLoading(true);

    try {
      await ownerVerificationApi.apply({
        governmentIdType,

        governmentIdNumber:
          governmentIdNumber.trim(),

        businessName:
          businessName.trim(),

        phoneNumber:
          phoneNumber.trim(),

        businessAddress:
          businessAddress.trim(),

        governmentIdFront,

        governmentIdBack,
      });

      toast.success(
        "Your owner application has been submitted."
      );

      setLocation(
        "/owner/verification"
      );

    } catch (error: any) {
      const responseData =
        error?.response?.data;

      let message =
        "Unable to submit your application.";

      if (
        typeof responseData === "string"
      ) {
        message = responseData;
      } else if (
        responseData?.message
      ) {
        message =
          responseData.message;
      }

      toast.error(message);

    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     INITIAL APPLICATION CHECK
     ========================================================= */

  if (checkingApplication) {
    return (
      <div className="min-h-screen bg-cream">

        <ApplicationHeader />

        <main className="max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-20">

          <div className="animate-pulse max-w-3xl">

            <div className="h-4 w-40 bg-warm-stone/20 rounded mb-5" />

            <div className="h-12 w-2/3 bg-warm-stone/20 rounded mb-5" />

            <div className="h-5 w-full max-w-xl bg-warm-stone/20 rounded mb-10" />

            <div className="h-[500px] bg-white border border-warm-stone/20 rounded-2xl" />

          </div>

        </main>

      </div>
    );
  }


  return (
    <div className="min-h-screen bg-cream">

      <ApplicationHeader />

      <main className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-16">

        {/* =====================================================
            INTRO
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
            duration: 0.45,
          }}
          className="max-w-3xl mb-10"
        >

          <p className="text-xs uppercase tracking-[0.2em] text-bronze font-semibold mb-4">
            BookMyStay Partners
          </p>

          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-espresso leading-[1.08]">
            Become a BookMyStay partner.
          </h1>

          <p className="mt-5 max-w-2xl text-muted-foreground text-base md:text-lg leading-relaxed">
            Start your journey as a property partner.
            Submit your business information and identity
            documents for verification.
          </p>

        </motion.div>


        {/* =====================================================
            PROGRESS
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.15,
          }}
          className="max-w-4xl mb-10"
        >

          <div className="flex items-center">

            <ProgressStep
              number="01"
              title="Application"
              description="Business details"
              active
            />

            <ProgressLine />

            <ProgressStep
              number="02"
              title="Verification"
              description="Application review"
            />

            <ProgressLine />

            <ProgressStep
              number="03"
              title="Property"
              description="Start listing"
            />

          </div>

        </motion.div>


        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8">

          {/* ===================================================
              FORM
          ==================================================== */}

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
              duration: 0.45,
              delay: 0.08,
            }}
            onSubmit={handleSubmit}
            noValidate
            className="bg-white border border-warm-stone/20 rounded-2xl overflow-hidden shadow-warm"
          >

            {/* FORM HEADER */}

            <div className="px-6 md:px-8 py-6 border-b border-warm-stone/20">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-bronze/10 flex items-center justify-center">

                  <FileCheck2 className="w-5 h-5 text-bronze" />

                </div>

                <div>

                  <h2 className="font-serif text-2xl font-semibold text-espresso">
                    Partner application
                  </h2>

                  <p className="text-sm text-muted-foreground mt-1">
                    Provide the information required for verification.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-6 md:p-8 space-y-9">

              {/* =================================================
                  BUSINESS INFORMATION
              ================================================== */}

              <section>

                <SectionHeading
                  icon={Building2}
                  title="Business information"
                  description="Tell us about the business you will operate on BookMyStay."
                />

                <div className="mt-6">

                  <Field
                    label="Business name"
                    required
                    error={
                      errors.businessName
                    }
                  >

                    <input
                      type="text"
                      value={
                        businessName
                      }
                      onChange={(event) => {

                        setBusinessName(
                          event.target.value
                        );

                        setErrors(
                          (current) => ({
                            ...current,
                            businessName:
                              undefined,
                          })
                        );

                      }}
                      placeholder="Enter your business name"
                      autoComplete="organization"
                      className={inputClass(
                        !!errors.businessName
                      )}
                    />

                  </Field>

                </div>

              </section>


              <Divider />


              {/* =================================================
                  IDENTITY
              ================================================== */}

              <section>

                <SectionHeading
                  icon={ShieldCheck}
                  title="Identity verification"
                  description="We need a valid government-issued identity document to verify your application."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

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
                        (id) => (
                          <option
                            key={
                              id.value
                            }
                            value={
                              id.value
                            }
                          >
                            {id.label}
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
                      type="text"
                      value={
                        governmentIdNumber
                      }
                      onChange={(event) => {

                        setGovernmentIdNumber(
                          event.target.value
                        );

                        setErrors(
                          (current) => ({
                            ...current,
                            governmentIdNumber:
                              undefined,
                          })
                        );

                      }}
                      placeholder="Enter your ID number"
                      autoComplete="off"
                      className={inputClass(
                        !!errors.governmentIdNumber
                      )}
                    />

                  </Field>

                </div>


                {/* DOCUMENTS */}

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
                      handleFileChange(
                        file,
                        "front"
                      )
                    }
                    onRemove={() => {

                      setGovernmentIdFront(
                        null
                      );

                      setErrors(
                        (current) => ({
                          ...current,
                          governmentIdFront:
                            undefined,
                        })
                      );

                    }}
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
                      handleFileChange(
                        file,
                        "back"
                      )
                    }
                    onRemove={() => {

                      setGovernmentIdBack(
                        null
                      );

                      setErrors(
                        (current) => ({
                          ...current,
                          governmentIdBack:
                            undefined,
                        })
                      );

                    }}
                  />

                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  Accepted formats: JPG, PNG, WEBP or PDF.
                  Maximum file size: 10 MB per document.
                </p>

              </section>


              <Divider />


              {/* =================================================
                  CONTACT
              ================================================== */}

              <section>

                <SectionHeading
                  icon={Phone}
                  title="Contact information"
                  description="We'll use these details if we need to contact you about your application."
                />

                <div className="grid grid-cols-1 gap-5 mt-6">

                  <Field
                    label="Phone number"
                    required
                    error={
                      errors.phoneNumber
                    }
                  >

                    <div className="relative">

                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                      <input
                        type="tel"
                        value={
                          phoneNumber
                        }
                        onChange={(event) => {

                          setPhoneNumber(
                            event.target.value.replace(
                              /\D/g,
                              ""
                            ).slice(0, 10)
                          );

                          setErrors(
                            (current) => ({
                              ...current,
                              phoneNumber:
                                undefined,
                            })
                          );

                        }}
                        placeholder="10-digit mobile number"
                        inputMode="numeric"
                        autoComplete="tel"
                        className={`${inputClass(
                          !!errors.phoneNumber
                        )} pl-10`}
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

                    <div className="relative">

                      <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />

                      <textarea
                        value={
                          businessAddress
                        }
                        onChange={(event) => {

                          setBusinessAddress(
                            event.target.value
                          );

                          setErrors(
                            (current) => ({
                              ...current,
                              businessAddress:
                                undefined,
                            })
                          );

                        }}
                        placeholder="Enter your complete business address"
                        rows={4}
                        className={`${inputClass(
                          !!errors.businessAddress
                        )} pl-10 resize-none`}
                      />

                    </div>

                  </Field>

                </div>

              </section>


              <Divider />


              {/* =================================================
                  SUBMIT
              ================================================== */}

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">

                <Link href="/list-property">

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-sm text-espresso/65 hover:text-espresso transition-colors"
                  >

                    <ArrowLeft className="w-4 h-4" />

                    Back

                  </button>

                </Link>


                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-bronze hover:bg-bronze-dark disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
                >

                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                      Submitting...

                    </>
                  ) : (
                    <>
                      Submit application

                      <ArrowRight className="w-4 h-4" />

                    </>
                  )}

                </button>

              </div>

            </div>

          </motion.form>


          {/* ===================================================
              SIDE INFORMATION
          ==================================================== */}

          <motion.aside
            initial={{
              opacity: 0,
              x: 15,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.45,
              delay: 0.2,
            }}
            className="space-y-5"
          >

            <div className="bg-espresso text-white rounded-2xl p-6">

              <div className="w-10 h-10 rounded-xl bg-bronze/15 flex items-center justify-center mb-5">

                <ShieldCheck className="w-5 h-5 text-bronze" />

              </div>

              <h3 className="font-serif text-xl font-semibold">
                Verification first
              </h3>

              <p className="mt-3 text-sm text-white/60 leading-relaxed">
                Every property partner goes through a verification
                process before gaining access to property management.
              </p>

            </div>


            <div className="bg-white border border-warm-stone/20 rounded-2xl p-6">

              <h3 className="font-medium text-espresso">
                What happens next?
              </h3>

              <div className="mt-5 space-y-5">

                <InfoStep
                  number="01"
                  title="Submit your application"
                  description="Provide your business and identity information."
                />

                <InfoStep
                  number="02"
                  title="Application review"
                  description="Our team reviews the information you submitted."
                />

                <InfoStep
                  number="03"
                  title="Start listing"
                  description="Once approved, you can begin creating your properties."
                />

              </div>

            </div>


            <div className="flex items-start gap-3 px-1">

              <ShieldCheck className="w-4 h-4 text-bronze shrink-0 mt-0.5" />

              <p className="text-xs text-muted-foreground leading-relaxed">
                Your submitted information and identity documents
                are handled securely.
              </p>

            </div>

          </motion.aside>

        </div>

      </main>

    </div>
  );
}


/* ============================================================
   HEADER
============================================================ */

function ApplicationHeader() {
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


/* ============================================================
   PROGRESS STEP
============================================================ */

function ProgressStep({
  number,
  title,
  description,
  active,
}: {
  number: string;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 shrink-0">

      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${
          active
            ? "bg-bronze text-white"
            : "border border-warm-stone/40 bg-white text-muted-foreground"
        }`}
      >
        {active ? (
          <Check className="w-4 h-4" />
        ) : (
          number
        )}
      </div>

      <div className="hidden sm:block">

        <p className="text-sm font-medium text-espresso">
          {title}
        </p>

        <p className="text-xs text-muted-foreground">
          {description}
        </p>

      </div>

    </div>
  );
}


function ProgressLine() {
  return (
    <div className="flex-1 min-w-5 h-px bg-warm-stone/30 mx-3 md:mx-5" />
  );
}


/* ============================================================
   SECTION HEADING
============================================================ */

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Building2;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="w-9 h-9 rounded-lg bg-bronze/10 flex items-center justify-center shrink-0">

        <Icon className="w-4 h-4 text-bronze" />

      </div>

      <div>

        <h3 className="font-medium text-espresso">
          {title}
        </h3>

        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {description}
        </p>

      </div>

    </div>
  );
}


/* ============================================================
   FIELD
============================================================ */

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

      <label className="block">

        <span className="text-sm font-medium text-espresso">

          {label}

          {required && (
            <span className="text-red-500 ml-1">
              *
            </span>
          )}

        </span>

        <div className="mt-2">
          {children}
        </div>

      </label>

      {error && (
        <p className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}

    </div>
  );
}


/* ============================================================
   INPUT CLASS
============================================================ */

function inputClass(hasError: boolean) {
  return `
    w-full
    rounded-xl
    border
    ${
      hasError
        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
        : "border-warm-stone/30 focus:border-bronze focus:ring-bronze/10"
    }
    bg-white
    px-3.5
    py-3
    text-sm
    text-espresso
    outline-none
    transition
    placeholder:text-muted-foreground/60
    focus:ring-4
  `;
}


/* ============================================================
   DOCUMENT UPLOAD
============================================================ */

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
  onChange: (file: File | undefined) => void;
  onRemove: () => void;
}) {
  return (
    <div>

      <p className="text-sm font-medium text-espresso">

        {label}

        <span className="text-red-500 ml-1">
          *
        </span>

      </p>

      {file ? (
        <div className="mt-2 border border-sage/30 bg-sage/5 rounded-xl p-4">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-lg bg-sage/10 flex items-center justify-center shrink-0">

              {file.type ===
              "application/pdf" ? (
                <FileCheck2 className="w-5 h-5 text-sage" />
              ) : (
                <FileImage className="w-5 h-5 text-sage" />
              )}

            </div>

            <div className="min-w-0 flex-1">

              <p className="text-sm font-medium text-espresso truncate">
                {file.name}
              </p>

              <p className="text-xs text-muted-foreground mt-0.5">
                {formatFileSize(file.size)}
              </p>

            </div>

            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${label}`}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
            >

              <X className="w-4 h-4" />

            </button>

          </div>

        </div>
      ) : (
        <label className="mt-2 flex flex-col items-center justify-center min-h-[150px] border border-dashed border-warm-stone/40 hover:border-bronze/50 rounded-xl bg-cream/40 hover:bg-bronze/5 cursor-pointer transition-colors">

          <Upload className="w-5 h-5 text-bronze mb-2" />

          <span className="text-sm font-medium text-espresso">
            Upload document
          </span>

          <span className="text-xs text-muted-foreground mt-1">
            JPG, PNG, WEBP or PDF
          </span>

          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            className="hidden"
            onChange={(event) => {

              onChange(
                event.target.files?.[0]
              );

              event.currentTarget.value =
                "";

            }}
          />

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


/* ============================================================
   INFO STEP
============================================================ */

function InfoStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">

      <div className="w-7 h-7 rounded-full bg-bronze/10 text-bronze flex items-center justify-center text-[11px] font-semibold shrink-0">
        {number}
      </div>

      <div>

        <p className="text-sm font-medium text-espresso">
          {title}
        </p>

        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {description}
        </p>

      </div>

    </div>
  );
}


/* ============================================================
   DIVIDER
============================================================ */

function Divider() {
  return (
    <div className="h-px bg-warm-stone/15" />
  );
}


/* ============================================================
   FILE SIZE
============================================================ */

function formatFileSize(
  bytes: number
) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}