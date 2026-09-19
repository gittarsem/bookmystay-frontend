import {
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ImagePlus,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import OwnerLayout from "@/layouts/OwnerLayout";

import {
  ownerHotelsApi,
  type HotelAmenity,
  type OwnerHotelRequest,
} from "@/api/ownerHotels";

/* =========================================================
   AMENITIES
========================================================= */

const HOTEL_AMENITIES: {
  value: HotelAmenity;
  label: string;
}[] = [
    {
      value: "FREE_WIFI",
      label: "Free Wi-Fi",
    },
    {
      value: "FREE_PARKING",
      label: "Free Parking",
    },
    {
      value: "SWIMMING_POOL",
      label: "Swimming Pool",
    },
    {
      value: "GYM",
      label: "Gym",
    },
    {
      value: "SPA",
      label: "Spa",
    },
    {
      value: "RESTAURANT",
      label: "Restaurant",
    },
    {
      value: "BAR",
      label: "Bar",
    },
    {
      value: "ROOM_SERVICE",
      label: "Room Service",
    },
    {
      value: "BREAKFAST_INCLUDED",
      label: "Breakfast Included",
    },
    {
      value: "AIR_CONDITIONING",
      label: "Air Conditioning",
    },
    {
      value: "ELEVATOR",
      label: "Elevator",
    },
    {
      value: "LAUNDRY_SERVICE",
      label: "Laundry Service",
    },
    {
      value: "FAMILY_ROOMS",
      label: "Family Rooms",
    },
    {
      value: "AIRPORT_SHUTTLE",
      label: "Airport Shuttle",
    },
    {
      value: "POWER_BACKUP",
      label: "Power Backup",
    },
    {
      value: "PET_FRIENDLY",
      label: "Pet Friendly",
    },
    {
      value: "BUSINESS_CENTER",
      label: "Business Center",
    },
    {
      value: "CONFERENCE_ROOM",
      label: "Conference Room",
    },
    {
      value: "CCTV_SECURITY",
      label: "CCTV Security",
    },
    {
      value: "EV_CHARGING",
      label: "EV Charging",
    },
  ];

/* =========================================================
   FORM
========================================================= */

interface HotelForm {
  name: string;
  city: string;
  state: string;
  address: string;
  phoneNumber: string;
  email: string;
  description: string;
  amenities: HotelAmenity[];
}

const initialForm: HotelForm = {
  name: "Hotel Name Here",
  city: "City Name Here",
  state: "State Name Here",
  address: "Hotel Address Here",
  phoneNumber: "Phone Number Here",
  email: "Email Address Here",
  description: "Hotel Description Here",
  amenities: [],
};

/* =========================================================
   PAGE
========================================================= */

export default function OwnerHotelCreate() {
  const [, setLocation] = useLocation();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [form, setForm] =
    useState<HotelForm>(initialForm);

  const [images, setImages] =
    useState<File[]>([]);

  const [submitting, setSubmitting] =
    useState(false);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  /* =======================================================
     PREVIEWS
  ======================================================== */

  const imagePreviews = useMemo(() => {
    return images.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [images]);

  /* =======================================================
     UPDATE FIELD
  ======================================================== */

  const updateField = (
    field: keyof HotelForm,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  /* =======================================================
     TOGGLE AMENITY
  ======================================================== */

  const toggleAmenity = (
    amenity: HotelAmenity
  ) => {
    setForm((current) => {
      const selected =
        current.amenities.includes(amenity);

      return {
        ...current,
        amenities: selected
          ? current.amenities.filter(
            (item) => item !== amenity
          )
          : [
            ...current.amenities,
            amenity,
          ],
      };
    });
  };

  /* =======================================================
     IMAGE SELECTION
  ======================================================== */

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selected =
      Array.from(event.target.files ?? []);

    if (!selected.length) {
      return;
    }

    setImages((current) => [
      ...current,
      ...selected,
    ]);

    event.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((current) =>
      current.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );
  };

  /* =======================================================
     VALIDATION
  ======================================================== */

  const validate = () => {
    const nextErrors: Record<
      string,
      string
    > = {};

    if (!form.name.trim()) {
      nextErrors.name =
        "Property name is required.";
    }

    if (!form.city.trim()) {
      nextErrors.city =
        "City is required.";
    }

    if (!form.address.trim()) {
      nextErrors.address =
        "Address is required.";
    }

    if (!form.phoneNumber.trim()) {
      nextErrors.phoneNumber =
        "Phone number is required.";
    } else if (
      !/^[6-9]\d{9}$/.test(
        form.phoneNumber.trim()
      )
    ) {
      nextErrors.phoneNumber =
        "Enter a valid 10-digit phone number.";
    }

    if (!form.email.trim()) {
      nextErrors.email =
        "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    if (!form.description.trim()) {
      nextErrors.description =
        "Description is required.";
    }

    if (!images.length) {
      nextErrors.images =
        "Please upload at least one property image.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  /* =======================================================
     SUBMIT
  ======================================================== */

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (!validate()) {
      toast.error(
        "Please complete the required fields."
      );

      return;
    }

    const request: OwnerHotelRequest = {
      name: form.name.trim(),
      city: `${form.city.trim()}, ${form.state.trim()}`,
      hotelContactInfo: {
        address: form.address.trim(),
        phoneNumber: form.phoneNumber.trim(),
        email: form.email.trim(),
      },
      description: form.description.trim(),
      amenities: form.amenities,
    };

    setSubmitting(true);

    try {
      await ownerHotelsApi.create(
        request,
        images
      );

      toast.success(
        "Property created successfully."
      );

      setLocation("/owner/hotels");
    } catch (error: any) {
      console.error(
        "Create hotel failed:",
        error
      );

      const responseData =
        error?.response?.data;

      let message =
        "Unable to create your property.";

      if (
        typeof responseData === "string"
      ) {
        message = responseData;
      } else if (
        responseData?.message
      ) {
        message = responseData.message;
      }

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================== */

  return (
    <OwnerLayout>
      <div className="max-w-5xl mx-auto">
        {/* =================================================
            HEADER
        ================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.35,
          }}
          className="mb-8"
        >
          <button
            type="button"
            onClick={() =>
              setLocation(
                "/owner/hotels"
              )
            }
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-espresso transition-colors mb-5"
          >
            <ArrowLeft className="w-4 h-4" />

            Back to My Hotels
          </button>

          <p className="text-xs uppercase tracking-[0.22em] text-bronze font-semibold">
            Property management
          </p>

          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-espresso mt-2">
            List a property
          </h1>

          <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
            Add your property details,
            amenities and photographs to
            create your BookMyStay listing.
          </p>
        </motion.div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* =================================================
              PROPERTY INFORMATION
          ================================================== */}

          <FormSection
            number="01"
            icon={Building2}
            title="Property information"
            description="Tell us about your property."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field
                label="Property name"
                required
                error={errors.name}
              >
                <input
                  value={form.name}
                  onChange={(event) =>
                    updateField(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="The Grand Palace"
                  className={inputClass(
                    !!errors.name
                  )}
                />
              </Field>

              <Field
                label="City"
                required
                error={errors.city}
              >
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                  <input
                    value={form.city}
                    onChange={(event) =>
                      updateField(
                        "city",
                        event.target.value
                      )
                    }
                    placeholder="Delhi"
                    className={`${inputClass(
                      !!errors.city
                    )} pl-10`}
                  />
                </div>
              </Field>
            </div>

            <Field
              label="Description"
              required
              error={errors.description}
            >
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                rows={6}
                placeholder="Describe your property and what makes it special."
                className={`${inputClass(
                  !!errors.description
                )} resize-none`}
              />

              <div className="flex justify-end mt-1">
                <span className="text-xs text-muted-foreground">
                  {form.description.length}{" "}
                  characters
                </span>
              </div>
            </Field>
          </FormSection>

          {/* =================================================
              CONTACT
          ================================================== */}

          <FormSection
            number="02"
            icon={Phone}
            title="Contact information"
            description="Contact details associated with the property."
          >
            <Field
              label="Address"
              required
              error={errors.address}
            >
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />

                <textarea
                  value={form.address}
                  onChange={(event) =>
                    updateField(
                      "address",
                      event.target.value
                    )
                  }
                  rows={3}
                  placeholder="Full property address"
                  className={`${inputClass(
                    !!errors.address
                  )} pl-10 resize-none`}
                />
              </div>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field
                label="Phone number"
                required
                error={errors.phoneNumber}
              >
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.phoneNumber}
                    onChange={(event) =>
                      updateField(
                        "phoneNumber",
                        event.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    placeholder="9876543210"
                    className={`${inputClass(
                      !!errors.phoneNumber
                    )} pl-10`}
                  />
                </div>
              </Field>

              <Field
                label="Email"
                required
                error={errors.email}
              >
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="hotel@example.com"
                    className={`${inputClass(
                      !!errors.email
                    )} pl-10`}
                  />
                </div>
              </Field>
            </div>
          </FormSection>

          {/* =================================================
              AMENITIES
          ================================================== */}

          <FormSection
            number="03"
            icon={Check}
            title="Amenities"
            description="Select the amenities available at your property."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {HOTEL_AMENITIES.map(
                (amenity) => {
                  const selected =
                    form.amenities.includes(
                      amenity.value
                    );

                  return (
                    <button
                      key={amenity.value}
                      type="button"
                      onClick={() =>
                        toggleAmenity(
                          amenity.value
                        )
                      }
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${selected
                          ? "border-bronze/50 bg-bronze/8 text-espresso"
                          : "border-warm-stone/20 bg-white text-espresso/70 hover:border-bronze/30 hover:bg-cream"
                        }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${selected
                            ? "bg-bronze border-bronze text-white"
                            : "border-warm-stone/40"
                          }`}
                      >
                        {selected && (
                          <Check className="w-3 h-3" />
                        )}
                      </span>

                      <span className="text-sm">
                        {amenity.label}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </FormSection>

          {/* =================================================
              IMAGES
          ================================================== */}

          <FormSection
            number="04"
            icon={ImagePlus}
            title="Property images"
            description="Upload photographs that represent your property."
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className={`w-full border-2 border-dashed rounded-2xl px-6 py-10 text-center transition-colors ${errors.images
                  ? "border-red-300 bg-red-50/30"
                  : "border-warm-stone/30 hover:border-bronze/50 hover:bg-cream/40"
                }`}
            >
              <div className="w-12 h-12 rounded-xl bg-bronze/10 flex items-center justify-center mx-auto">
                <Upload className="w-5 h-5 text-bronze" />
              </div>

              <p className="mt-4 text-sm font-semibold text-espresso">
                Upload property images
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Select one or more images
              </p>
            </button>

            {errors.images && (
              <p className="mt-2 text-xs text-red-600">
                {errors.images}
              </p>
            )}

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-5">
                {imagePreviews.map(
                  (preview, index) => (
                    <div
                      key={`${preview.file.name}-${index}`}
                      className="relative aspect-[4/3] rounded-xl overflow-hidden border border-warm-stone/20 bg-cream group"
                    >
                      <img
                        src={preview.url}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(index)
                        }
                        aria-label={`Remove image ${index + 1}`}
                        className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white/95 text-red-500 flex items-center justify-center shadow-sm sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/65 text-white text-[10px] font-medium">
                          Primary image
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </FormSection>

          {/* =================================================
              ACTIONS
          ================================================== */}

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 pb-8">
            <button
              type="button"
              disabled={submitting}
              onClick={() =>
                setLocation(
                  "/owner/hotels"
                )
              }
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-medium text-espresso/65 hover:text-espresso hover:bg-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-bronze hover:bg-bronze-dark text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating property...
                </>
              ) : (
                <>
                  Create Property
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </OwnerLayout>
  );
}

/* =========================================================
   FORM SECTION
========================================================= */

function FormSection({
  number,
  icon: Icon,
  title,
  description,
  children,
}: {
  number: string;
  icon: typeof Building2;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
      }}
      className="bg-white border border-warm-stone/20 rounded-2xl overflow-hidden"
    >
      <div className="px-5 sm:px-7 py-5 border-b border-warm-stone/15">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-bronze/10 flex items-center justify-center shrink-0">
            <Icon className="w-[18px] h-[18px] text-bronze" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold tracking-[0.16em] text-bronze">
                {number}
              </span>

              <h2 className="font-serif text-lg sm:text-xl font-semibold text-espresso">
                {title}
              </h2>
            </div>

            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7 space-y-5">
        {children}
      </div>
    </motion.section>
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
      <label className="block">
        <span className="flex items-center gap-1.5 text-sm font-medium text-espresso mb-2">
          {label}

          {required && (
            <span
              className="text-bronze"
              aria-hidden="true"
            >
              *
            </span>
          )}
        </span>

        {children}
      </label>

      {error && (
        <p className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   INPUT
========================================================= */

function inputClass(
  hasError: boolean
) {
  return `w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-espresso placeholder:text-muted-foreground/60 outline-none transition-all ${hasError
      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-warm-stone/25 focus:border-bronze/50 focus:ring-2 focus:ring-bronze/10"
    }`;
}