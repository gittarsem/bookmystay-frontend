import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

import {
  Building2,
  User,
  ArrowRight,
  Save,
  Loader2,
  LogOut,
  AlertTriangle,
} from "lucide-react";

import { toast } from "sonner";

import DashboardLayout from "@/layouts/DashboardLayout";
import { ownerSettingsApi } from "@/api/ownerSettings";
import { useAuth } from "@/contexts/AuthContext";

export default function OwnerSettings() {
  const [, navigate] = useLocation();

  const {
    refreshUser,
  } = useAuth();

  const [businessName, setBusinessName] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [switching, setSwitching] =
    useState(false);

  const [showSwitchConfirm, setShowSwitchConfirm] =
    useState(false);

  /*
   * =========================================================
   * LOAD OWNER SETTINGS
   * =========================================================
   */

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const response =
        await ownerSettingsApi.getSettings();

      setBusinessName(
        response.data.businessName ?? ""
      );
    } catch (error: any) {
      console.error(
        "Failed to load owner settings:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to load owner settings."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================================
   * UPDATE BUSINESS NAME
   * =========================================================
   */

  const handleBusinessNameUpdate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedName =
      businessName.trim();

    if (!trimmedName) {
      toast.error(
        "Business name is required."
      );

      return;
    }

    try {
      setSaving(true);

      const response =
        await ownerSettingsApi.updateBusinessName({
          businessName: trimmedName,
        });

      setBusinessName(
        response.data.businessName
      );

      toast.success(
        "Business name updated successfully."
      );
    } catch (error: any) {
      console.error(
        "Failed to update business name:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to update business name."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * =========================================================
   * SWITCH OWNER → GUEST
   * =========================================================
   */

  const handleSwitchToGuest = async () => {
    try {
      setSwitching(true);

      await ownerSettingsApi.switchToGuest();

      /*
       * Get the updated user from backend.
       *
       * This is important because roles must come
       * from backend rather than manually modifying
       * React state.
       */
      await refreshUser();

      toast.success(
        "Your account is now in guest mode."
      );

      navigate("/");
    } catch (error: any) {
      console.error(
        "Failed to switch to guest:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to switch to guest mode."
      );
    } finally {
      setSwitching(false);
      setShowSwitchConfirm(false);
    }
  };

  return (
    <DashboardLayout role="owner">

      <div className="mx-auto w-full max-w-5xl space-y-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bronze">
            Partner Portal
          </p>

          <h1 className="mt-2 font-serif text-3xl font-bold text-espresso">
            Settings
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Manage your business settings and
            owner account.
          </p>
        </div>


        {/* =====================================================
            BUSINESS INFORMATION
        ===================================================== */}

        <section className="overflow-hidden rounded-2xl border border-warm-stone/20 bg-white shadow-warm">

          {/* Section header */}

          <div className="flex items-center gap-4 px-6 py-6 md:px-8">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bronze/10">
              <Building2 className="h-5 w-5 text-bronze" />
            </div>

            <div>
              <h2 className="font-serif text-xl font-semibold text-espresso">
                Business Information
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Update the business name associated
                with your owner account.
              </p>
            </div>

          </div>

          <div className="border-t border-warm-stone/20" />


          {/* Form */}

          <form
            onSubmit={handleBusinessNameUpdate}
            className="px-6 py-7 md:px-8"
          >

            <div className="max-w-2xl">

              <label
                htmlFor="business-name"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Business Name
              </label>

              {loading ? (

                <div className="flex h-12 items-center gap-3 rounded-xl border border-warm-stone/20 bg-cream/30 px-4 text-sm text-muted-foreground">

                  <Loader2 className="h-4 w-4 animate-spin" />

                  Loading business information...

                </div>

              ) : (

                <input
                  id="business-name"
                  type="text"
                  value={businessName}
                  onChange={(event) =>
                    setBusinessName(
                      event.target.value
                    )
                  }
                  maxLength={150}
                  disabled={saving}
                  placeholder="Enter business name"
                  className="h-12 w-full rounded-xl border border-warm-stone/25 bg-cream/20 px-4 text-sm text-espresso outline-none transition placeholder:text-muted-foreground/60 focus:border-bronze focus:bg-white focus:ring-2 focus:ring-bronze/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

              )}

              <p className="mt-2 text-xs text-muted-foreground">
                This is the business name associated
                with your verified owner account.
              </p>

            </div>


            <div className="mt-6 flex justify-start">

              <button
                type="submit"
                disabled={
                  loading ||
                  saving ||
                  !businessName.trim()
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-bronze px-5 py-3 text-sm font-semibold text-white transition hover:bg-bronze-dark disabled:cursor-not-allowed disabled:opacity-50"
              >

                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
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

        </section>


        {/* =====================================================
            PERSONAL PROFILE
        ===================================================== */}

        <section className="overflow-hidden rounded-2xl border border-warm-stone/20 bg-white shadow-warm">

          <div className="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between md:px-8">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bronze/10">
                <User className="h-5 w-5 text-bronze" />
              </div>

              <div>
                <h2 className="font-serif text-xl font-semibold text-espresso">
                  Personal Profile
                </h2>

                <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                  Manage your personal information,
                  password, and account security.
                </p>
              </div>

            </div>


            <button
              type="button"
              onClick={() =>
                navigate("/profile")
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-warm-stone/30 px-4 py-2.5 text-sm font-medium text-espresso transition hover:bg-cream"
            >
              View Profile

              <ArrowRight className="h-4 w-4" />
            </button>

          </div>

        </section>


        {/* =====================================================
            ACCOUNT MODE
        ===================================================== */}

        <section className="overflow-hidden rounded-2xl border border-red-200/70 bg-white shadow-warm">

          <div className="px-6 py-6 md:px-8">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
                <LogOut className="h-5 w-5 text-red-600" />
              </div>

              <div>

                <h2 className="font-serif text-xl font-semibold text-espresso">
                  Switch to Guest
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Leave the Partner Portal and continue
                  using BookMyStay as a guest.
                </p>

              </div>

            </div>


            <div className="mt-6">

              <button
                type="button"
                onClick={() =>
                  setShowSwitchConfirm(true)
                }
                disabled={switching}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <LogOut className="h-4 w-4" />

                Switch to Guest

              </button>

            </div>

          </div>

        </section>

      </div>


      {/* =======================================================
          SWITCH TO GUEST MODAL
      ======================================================= */}

      {showSwitchConfirm && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onMouseDown={(event) => {

            if (
              event.target === event.currentTarget &&
              !switching
            ) {
              setShowSwitchConfirm(false);
            }

          }}
        >

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.97,
              y: 8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              duration: 0.18,
            }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >

            {/* Icon */}

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">

              <AlertTriangle className="h-5 w-5 text-red-600" />

            </div>


            {/* Content */}

            <h2 className="mt-5 font-serif text-xl font-semibold text-espresso">
              Switch to Guest?
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Your account will no longer have owner
              access and you will return to the guest
              experience.
            </p>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Your owner information and properties
              remain stored in BookMyStay.
            </p>


            {/* Actions */}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                disabled={switching}
                onClick={() =>
                  setShowSwitchConfirm(false)
                }
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-espresso transition hover:bg-cream disabled:opacity-50"
              >
                Cancel
              </button>


              <button
                type="button"
                disabled={switching}
                onClick={handleSwitchToGuest}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {switching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Switching...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    Switch to Guest
                  </>
                )}

              </button>

            </div>

          </motion.div>

        </div>

      )}

    </DashboardLayout>
  );
}