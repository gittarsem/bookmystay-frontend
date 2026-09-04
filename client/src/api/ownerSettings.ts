import api from "./axios";

export interface OwnerSettings {
  businessName: string;
}

export interface UpdateBusinessNameRequest {
  businessName: string;
}

export const ownerSettingsApi = {
  getSettings() {
    return api.get<OwnerSettings>("/owner/settings");
  },

  updateBusinessName(data: UpdateBusinessNameRequest) {
    return api.patch<OwnerSettings>(
      "/owner/settings/business-name",
      data
    );
  },

  switchToGuest() {
    return api.patch<string>(
      "/owner/settings/switch-to-guest"
    );
  },
};