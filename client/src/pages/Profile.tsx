import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { motion } from "framer-motion";

import {
  User,
  Mail,
  Shield,
  Lock,
  Trash2,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  CalendarDays,
} from "lucide-react";

import { toast } from "sonner";
import { useLocation } from "wouter";

import { useAuth } from "@/contexts/AuthContext";
import {
  profileApi,
  type Profile as ProfileData,
} from "@/api/profile";

import DashboardLayout from "@/layouts/DashboardLayout";


export default function Profile() {
  const [, navigate] = useLocation();

  const {
    roles,
    refreshUser,
    logout,
  } = useAuth();

  /*
   * =========================================================
   * DASHBOARD ROLE
   * =========================================================
   *
   * DashboardLayout currently supports:
   * "owner" | "admin"
   *
   * Admin gets the admin layout.
   * Everyone else using this dashboard layout gets owner layout.
   */

  const dashboardRole =
    roles.includes("ROLE_ADMIN")
      ? "admin"
      : "owner";


  /*
   * =========================================================
   * PROFILE STATE
   * =========================================================
   */

  const [profile, setProfile] =
    useState<ProfileData | null>(null);

  const [name, setName] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);


  /*
   * =========================================================
   * MODAL STATE
   * =========================================================
   */

  const [
    showPasswordModal,
    setShowPasswordModal,
  ] = useState(false);

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false);


  /*
   * =========================================================
   * PASSWORD STATE
   * =========================================================
   */

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);


  /*
   * =========================================================
   * DELETE STATE
   * =========================================================
   */

  const [
    deletePassword,
    setDeletePassword,
  ] = useState("");

  const [
    deleteConfirmation,
    setDeleteConfirmation,
  ] = useState("");

  const [
    deleting,
    setDeleting,
  ] = useState(false);


  /*
   * =========================================================
   * LOAD PROFILE
   * =========================================================
   */

  const loadProfile = async () => {
    try {
      setLoading(true);

      const response =
        await profileApi.getProfile();

      setProfile(response.data);
      setName(response.data.name);
    } catch (error: any) {
      console.error(
        "Failed to load profile:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadProfile();
  }, []);


  /*
   * =========================================================
   * UPDATE PROFILE
   * =========================================================
   */

  const handleUpdateProfile = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedName =
      name.trim();

    if (!trimmedName) {
      toast.error(
        "Name is required."
      );

      return;
    }

    if (trimmedName.length < 2) {
      toast.error(
        "Name must be at least 2 characters."
      );

      return;
    }

    try {
      setSaving(true);

      const response =
        await profileApi.updateProfile({
          name: trimmedName,
        });

      setProfile(response.data);
      setName(response.data.name);

      /*
       * Keep AuthContext synchronized
       * with the backend.
       */

      await refreshUser();

      toast.success(
        "Profile updated successfully."
      );
    } catch (error: any) {
      console.error(
        "Failed to update profile:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };


  /*
   * =========================================================
   * CHANGE PASSWORD
   * =========================================================
   */

  const handleChangePassword = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!currentPassword) {
      toast.error(
        "Enter your current password."
      );

      return;
    }

    if (!newPassword) {
      toast.error(
        "Enter a new password."
      );

      return;
    }

    if (newPassword.length < 8) {
      toast.error(
        "New password must be at least 8 characters."
      );

      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(
        "New passwords do not match."
      );

      return;
    }

    try {
      setChangingPassword(true);

      await profileApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      toast.success(
        "Password changed successfully."
      );

      closePasswordModal();
    } catch (error: any) {
      console.error(
        "Failed to change password:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };


  /*
   * =========================================================
   * DELETE ACCOUNT
   * =========================================================
   */

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error(
        "Enter your current password."
      );

      return;
    }

    if (deleteConfirmation !== "DELETE") {
      toast.error(
        "Type DELETE to confirm account deletion."
      );

      return;
    }

    try {
      setDeleting(true);

      await profileApi.deleteAccount({
        currentPassword: deletePassword,
        confirmation: deleteConfirmation,
      });

      toast.success(
        "Your account has been deleted."
      );

      /*
       * Clear authentication state.
       */

      await logout();

      navigate("/");
    } catch (error: any) {
      console.error(
        "Failed to delete account:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to delete account."
      );
    } finally {
      setDeleting(false);
    }
  };


  /*
   * =========================================================
   * CLOSE PASSWORD MODAL
   * =========================================================
   */

  const closePasswordModal = () => {
    if (changingPassword) {
      return;
    }

    setShowPasswordModal(false);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };


  /*
   * =========================================================
   * CLOSE DELETE MODAL
   * =========================================================
   */

  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }

    setShowDeleteModal(false);

    setDeletePassword("");
    setDeleteConfirmation("");
  };


  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <DashboardLayout
        role={dashboardRole}
      >
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading profile...
          </div>
        </div>
      </DashboardLayout>
    );
  }


  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <DashboardLayout
      role={dashboardRole}
    >
      <div className="mx-auto w-full max-w-5xl space-y-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div>
          <button
            type="button"
            onClick={() =>
              navigate(
                dashboardRole === "admin"
                  ? "/admin"
                  : "/owner"
              )
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-espresso"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bronze">
            Account
          </p>

          <h1 className="mt-2 font-serif text-3xl font-bold text-espresso">
            Profile
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Manage your personal information and
            account security.
          </p>
        </div>


        {/* =====================================================
            PERSONAL INFORMATION
        ===================================================== */}

        <section className="overflow-hidden rounded-2xl border border-warm-stone/20 bg-white shadow-warm">

          <div className="flex items-center gap-4 px-6 py-6 md:px-8">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bronze/10">
              <User className="h-5 w-5 text-bronze" />
            </div>

            <div>
              <h2 className="font-serif text-xl font-semibold text-espresso">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Update your basic account information.
              </p>
            </div>

          </div>

          <div className="border-t border-warm-stone/20" />

          <form
            onSubmit={handleUpdateProfile}
            className="space-y-6 px-6 py-7 md:px-8"
          >

            <div className="grid gap-6 md:grid-cols-2">

              {/* NAME */}

              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Full Name
                </label>

                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    maxLength={100}
                    disabled={saving}
                    className="h-12 w-full rounded-xl border border-warm-stone/25 bg-cream/20 pl-11 pr-4 text-sm text-espresso outline-none transition focus:border-bronze focus:bg-white focus:ring-2 focus:ring-bronze/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>


              {/* EMAIL */}

              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    id="profile-email"
                    type="email"
                    value={
                      profile?.email ?? ""
                    }
                    readOnly
                    className="h-12 w-full cursor-not-allowed rounded-xl border border-warm-stone/20 bg-stone-50 pl-11 pr-4 text-sm text-muted-foreground outline-none"
                  />
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Your email address cannot be changed.
                </p>
              </div>

            </div>


            {/* SAVE */}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={
                  saving ||
                  !name.trim()
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
            ACCOUNT DETAILS
        ===================================================== */}

        <section className="overflow-hidden rounded-2xl border border-warm-stone/20 bg-white shadow-warm">

          <div className="flex items-center gap-4 px-6 py-6 md:px-8">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bronze/10">
              <Shield className="h-5 w-5 text-bronze" />
            </div>

            <div>
              <h2 className="font-serif text-xl font-semibold text-espresso">
                Account Details
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Information about your BookMyStay account.
              </p>
            </div>

          </div>

          <div className="border-t border-warm-stone/20" />

          <div className="grid gap-5 px-6 py-7 md:grid-cols-2 md:px-8">

            {/* EMAIL */}

            <div className="rounded-xl border border-warm-stone/15 bg-cream/20 p-4">

              <div className="flex items-center gap-3">

                <Mail className="h-4 w-4 text-bronze" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm font-medium text-espresso">
                    {profile?.email || "—"}
                  </p>
                </div>

              </div>

            </div>


            {/* MEMBER SINCE */}

            <div className="rounded-xl border border-warm-stone/15 bg-cream/20 p-4">

              <div className="flex items-center gap-3">

                <CalendarDays className="h-4 w-4 text-bronze" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Member Since
                  </p>

                  <p className="mt-1 text-sm font-medium text-espresso">
                    {profile?.created_at
                      ? new Date(
                          profile.created_at
                        ).toLocaleDateString(
                          undefined,
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "—"}
                  </p>
                </div>

              </div>

            </div>


            {/* ROLES */}

            <div className="rounded-xl border border-warm-stone/15 bg-cream/20 p-4 md:col-span-2">

              <div className="flex items-start gap-3">

                <Shield className="mt-0.5 h-4 w-4 text-bronze" />

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Account Roles
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">

                    {profile?.roles?.length ? (
                      profile.roles.map(
                        (role) => (
                          <span
                            key={role}
                            className="rounded-full border border-bronze/20 bg-bronze/5 px-3 py-1 text-xs font-medium text-bronze"
                          >
                            {role
                              .replace(
                                "ROLE_",
                                ""
                              )
                              .replaceAll(
                                "_",
                                " "
                              )}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No roles assigned
                      </span>
                    )}

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            SECURITY
        ===================================================== */}

        <section className="overflow-hidden rounded-2xl border border-warm-stone/20 bg-white shadow-warm">

          <div className="flex items-center gap-4 px-6 py-6 md:px-8">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bronze/10">
              <Lock className="h-5 w-5 text-bronze" />
            </div>

            <div>
              <h2 className="font-serif text-xl font-semibold text-espresso">
                Security
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Keep your account secure by regularly
                updating your password.
              </p>
            </div>

          </div>

          <div className="border-t border-warm-stone/20" />

          <div className="flex flex-col gap-5 px-6 py-7 sm:flex-row sm:items-center sm:justify-between md:px-8">

            <div>
              <p className="text-sm font-semibold text-espresso">
                Password
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Change your BookMyStay password.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowPasswordModal(true)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-warm-stone/30 px-5 py-3 text-sm font-semibold text-espresso transition hover:bg-cream"
            >
              <Lock className="h-4 w-4" />
              Change Password
            </button>

          </div>

        </section>


        {/* =====================================================
            DANGER ZONE
        ===================================================== */}

        <section className="overflow-hidden rounded-2xl border border-red-200/70 bg-white shadow-warm">

          <div className="px-6 py-6 md:px-8">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>

              <div>
                <h2 className="font-serif text-xl font-semibold text-espresso">
                  Danger Zone
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Permanently delete your BookMyStay
                  account and remove your account access.
                </p>
              </div>

            </div>

            <div className="mt-6">

              <button
                type="button"
                onClick={() =>
                  setShowDeleteModal(true)
                }
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>

            </div>

          </div>

        </section>

      </div>


      {/* =======================================================
          CHANGE PASSWORD MODAL
      ======================================================= */}

      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !changingPassword
            ) {
              closePasswordModal();
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
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bronze/10">
              <Lock className="h-5 w-5 text-bronze" />
            </div>

            <h2 className="mt-5 font-serif text-xl font-semibold text-espresso">
              Change Password
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Enter your current password and choose
              a new password for your account.
            </p>


            <form
              onSubmit={handleChangePassword}
              className="mt-6 space-y-4"
            >

              <PasswordInput
                id="current-password"
                label="Current Password"
                value={currentPassword}
                onChange={setCurrentPassword}
                visible={showCurrentPassword}
                onToggle={() =>
                  setShowCurrentPassword(
                    (value) => !value
                  )
                }
                disabled={changingPassword}
              />


              <PasswordInput
                id="new-password"
                label="New Password"
                value={newPassword}
                onChange={setNewPassword}
                visible={showNewPassword}
                onToggle={() =>
                  setShowNewPassword(
                    (value) => !value
                  )
                }
                disabled={changingPassword}
              />


              <PasswordInput
                id="confirm-password"
                label="Confirm New Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                visible={showConfirmPassword}
                onToggle={() =>
                  setShowConfirmPassword(
                    (value) => !value
                  )
                }
                disabled={changingPassword}
              />


              <p className="pt-1 text-xs text-muted-foreground">
                Password must contain at least 8 characters.
              </p>


              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  disabled={changingPassword}
                  onClick={closePasswordModal}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-espresso transition hover:bg-cream disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-bronze px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-bronze-dark disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {changingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Update Password
                    </>
                  )}

                </button>

              </div>

            </form>

          </motion.div>

        </div>
      )}


      {/* =======================================================
          DELETE ACCOUNT MODAL
      ======================================================= */}

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !deleting
            ) {
              closeDeleteModal();
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
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>

            <h2 className="mt-5 font-serif text-xl font-semibold text-espresso">
              Delete Account?
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This action cannot be undone. You will
              lose access to your BookMyStay account.
            </p>


            <div className="mt-5 rounded-xl border border-red-100 bg-red-50/50 p-4">

              <p className="text-xs font-medium leading-5 text-red-700">
                Enter your current password and type{" "}
                <strong>DELETE</strong>{" "}
                to confirm.
              </p>

            </div>


            <div className="mt-5 space-y-4">

              {/* PASSWORD */}

              <div>

                <label
                  htmlFor="delete-password"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Current Password
                </label>

                <input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(event) =>
                    setDeletePassword(
                      event.target.value
                    )
                  }
                  disabled={deleting}
                  className="h-12 w-full rounded-xl border border-warm-stone/25 bg-cream/20 px-4 text-sm text-espresso outline-none transition focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100 disabled:opacity-60"
                />

              </div>


              {/* CONFIRMATION */}

              <div>

                <label
                  htmlFor="delete-confirmation"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Type DELETE
                </label>

                <input
                  id="delete-confirmation"
                  type="text"
                  value={deleteConfirmation}
                  onChange={(event) =>
                    setDeleteConfirmation(
                      event.target.value
                    )
                  }
                  disabled={deleting}
                  placeholder="DELETE"
                  autoCapitalize="characters"
                  className="h-12 w-full rounded-xl border border-warm-stone/25 bg-cream/20 px-4 text-sm font-medium uppercase text-espresso outline-none transition focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100 disabled:opacity-60"
                />

              </div>

            </div>


            {/* ACTIONS */}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                disabled={deleting}
                onClick={closeDeleteModal}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-espresso transition hover:bg-cream disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  deleting ||
                  deleteConfirmation !== "DELETE"
                }
                onClick={handleDeleteAccount}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Account
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


/*
 * ===========================================================
 * PASSWORD INPUT
 * ===========================================================
 */

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  disabled: boolean;
}


function PasswordInput({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
  disabled,
}: PasswordInputProps) {
  return (
    <div>

      <label
        htmlFor={id}
        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </label>

      <div className="relative">

        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <input
          id={id}
          type={
            visible
              ? "text"
              : "password"
          }
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          disabled={disabled}
          className="h-12 w-full rounded-xl border border-warm-stone/25 bg-cream/20 pl-11 pr-12 text-sm text-espresso outline-none transition focus:border-bronze focus:bg-white focus:ring-2 focus:ring-bronze/10 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={onToggle}
          disabled={disabled}
          aria-label={
            visible
              ? `Hide ${label}`
              : `Show ${label}`
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition hover:bg-cream hover:text-espresso disabled:opacity-50"
        >

          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}

        </button>

      </div>

    </div>
  );
}