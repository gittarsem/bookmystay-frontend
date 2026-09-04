import api from "./axios";

export interface Profile {
  id: number;
  name: string;
  email: string;
  roles: string[];
  created_at: string;
}

export interface UpdateProfileRequest {
  name: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DeleteAccountRequest {
  currentPassword: string;
  confirmation: string;
}

export const profileApi = {
  getProfile() {
    return api.get<Profile>("/profile");
  },

  updateProfile(data: UpdateProfileRequest) {
    return api.patch<Profile>("/profile", data);
  },

  changePassword(data: ChangePasswordRequest) {
    return api.patch<string>(
      "/profile/password",
      data
    );
  },

  deleteAccount(data: DeleteAccountRequest) {
    return api.delete<string>("/profile", {
      data,
    });
  },
};