import {
  useEffect,
  useState,
} from "react";
import {
  ArrowLeft,
  Building2,
  Check,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
} from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";
import { toast } from "sonner";

import OwnerLayout from "@/layouts/OwnerLayout";

import {
  ownerHotelsApi,
  type HotelAmenity,
  type OwnerHotelRequest,
} from "@/api/ownerHotels";

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
  name: "",
  city: "",
  state: "",
  address: "",
  phoneNumber: "",
  email: "",
  description: "",
  amenities: [],
};

function splitCityState(value: string) {
  const parts = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return {
      city: parts[0],
      state: parts.slice(1).join(", "),
    };
  }

  return {
    city: value.trim(),
    state: "",
  };
}

export default function OwnerHotelEdit() {
  const [, setLocation] = useLocation();

  const [, params] = useRoute(
    "/owner/hotels/:hotelId/edit"
  );

  const hotelId = Number(params?.hotelId);

  const [form, setForm] =
    useState<HotelForm>(initialForm);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  useEffect(() => {
    loadHotel();
  }, [hotelId]);

  async function loadHotel() {
    if (
      !hotelId ||
      Number.isNaN(hotelId)
    ) {
      setLoading(false);
      toast.error("Invalid property.");
      return;
    }

    try {
      setLoading(true);

      const [hotelResponse, infoResponse] =
        await Promise.all([
          ownerHotelsApi.getById(hotelId),
          ownerHotelsApi.getInfo(hotelId),
        ]);

      const hotel = hotelResponse.data;
      const info = infoResponse.data;

      const location = splitCityState(
        hotel.city
      );

      setForm({
        name: hotel.name ?? "",
        city: location.city,
        state: location.state,
        address:
          hotel.hotelContactInfo?.address ?? "",
        phoneNumber:
          hotel.hotelContactInfo?.phoneNumber ??
          "",
        email:
          hotel.hotelContactInfo?.email ?? "",
        description:
          info.description ?? "",
        amenities:
          info.amenities ?? [],
      });
    } catch (error: any) {
      console.error(
        "Load hotel for editing failed:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to load property."
      );

      setLocation("/owner/hotels");
    } finally {
      setLoading(false);
    }
  }

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

    if (!form.state.trim()) {
      nextErrors.state =
        "State is required.";
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

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

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
        phoneNumber:
          form.phoneNumber.trim(),
        email: form.email.trim(),
      },
      description:
        form.description.trim(),
      amenities: form.amenities,
    };

    try {
      setSubmitting(true);

      await ownerHotelsApi.update(
        hotelId,
        request
      );

      toast.success(
        "Property updated successfully."
      );

      setLocation(
        `/owner/hotels/${hotelId}`
      );
    } catch (error: any) {
      console.error(
        "Update hotel failed:",
        error
      );

      const responseData =
        error?.response?.data;

      let message =
        "Unable to update your property.";

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

  if (loading) {
    return (
      <OwnerLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-bronze" />
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout>
      <div className="mx-auto max-w-5xl">
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
                `/owner/hotels/${hotelId}`
              )
            }
            className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-espresso"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Property
          </button>

          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-bronze">
            Property management
          </p>

          <h1 className="mt-2 font-serif text-3xl font-semibold text-espresso md:text-4xl">
            Edit Property
          </h1>

          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            Update your property details,
            location, contact information and
            amenities.
          </p>
        </motion.div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <FormSection
            number="01"
            icon={Building2}
            title="Property information"
            description="Update your property name and location."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                  <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    value={form.city}
                    onChange={(event) =>
                      updateField(
                        "city",
                        event.target.value
                      )
                    }
                    placeholder="Amritsar"
                    className={`${inputClass(
                      !!errors.city
                    )} pl-10`}
                  />
                </div>
              </Field>

              <Field
                label="State"
                required
                error={errors.state}
              >
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    value={form.state}
                    onChange={(event) =>
                      updateField(
                        "state",
                        event.target.value
                      )
                    }
                    placeholder="Punjab"
                    className={`${inputClass(
                      !!errors.state
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

              <div className="mt-1 flex justify-end">
                <span className="text-xs text-muted-foreground">
                  {form.description.length}{" "}
                  characters
                </span>
              </div>
            </Field>
          </FormSection>

          <FormSection
            number="02"
            icon={Phone}
            title="Contact information"
            description="Update the contact details associated with your property."
          >
            <Field
              label="Address"
              required
              error={errors.address}
            >
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />

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
                  )} resize-none pl-10`}
                />
              </div>
            </Field>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label="Phone number"
                required
                error={errors.phoneNumber}
              >
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

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
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

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

          <FormSection
            number="03"
            icon={Check}
            title="Amenities"
            description="Update the amenities available at your property."
          >
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
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
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                        selected
                          ? "border-bronze/50 bg-bronze/8 text-espresso"
                          : "border-warm-stone/20 bg-white text-espresso/70 hover:border-bronze/30 hover:bg-cream"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                          selected
                            ? "border-bronze bg-bronze text-white"
                            : "border-warm-stone/40"
                        }`}
                      >
                        {selected && (
                          <Check className="h-3 w-3" />
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

          <div className="flex flex-col-reverse gap-4 pb-8 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              disabled={submitting}
              onClick={() =>
                setLocation(
                  `/owner/hotels/${hotelId}`
                )
              }
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium text-espresso/65 transition-colors hover:bg-white hover:text-espresso disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-bronze px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-bronze-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </OwnerLayout>
  );
}

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
      className="overflow-hidden rounded-2xl border border-warm-stone/20 bg-white"
    >
      <div className="border-b border-warm-stone/15 px-5 py-5 sm:px-7">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bronze/10">
            <Icon className="h-[18px] w-[18px] text-bronze" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold tracking-[0.16em] text-bronze">
                {number}
              </span>

              <h2 className="font-serif text-lg font-semibold text-espresso sm:text-xl">
                {title}
              </h2>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-7">
        {children}
      </div>
    </motion.section>
  );
}

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
        <span className="mb-2 flex items-center gap-1.5 text-sm font-medium text-espresso">
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

function inputClass(
  hasError: boolean
) {
  return `w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-espresso placeholder:text-muted-foreground/60 outline-none transition-all ${
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-warm-stone/25 focus:border-bronze/50 focus:ring-2 focus:ring-bronze/10"
  }`;
}