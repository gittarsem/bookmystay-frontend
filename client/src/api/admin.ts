import api from "./axios";

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  created_at: string;
}

export interface AdminHotel {
  id: number;
  name: string;
  city: string;
  active: boolean;
  averageRating?: number;
  totalReviews?: number;
}

export interface OwnerVerification {
  id: number;
  applicantName: string;
  applicantEmail: string;

  governmentIdType: string;
  governmentIdNumber: string;

  govtIdFront?: string | null;
  govtIdBack?: string | null;

  businessName: string;
  phoneNumber: string;
  businessAddress: string;

  verificationStatus: string;
  rejectionReason?: string | null;
  submittedAt: string;
}

export interface AdminReview {
  reviewId: number;
  guestName: string;
  rating: number;
  comment: string;
  createdAt: string;
  hotelId?: number;
  hotelName?: string;
}

export interface AdminReport {
  id: number;
  status: string;
  reason?: string;
  description?: string;
  createdAt?: string;
}

export interface AdminActivity {
  id: number;
  action: string;
  description?: string;
  createdAt: string;
  adminName?: string;
}

export const adminApi = {
  /* =========================
     USERS
  ========================= */

  getUsers: async (
    params?: {
      search?: string;
      role?: string;
      page?: number;
      size?: number;
    },
  ) => {
    const response = await api.get<PageResponse<AdminUser>>(
      "/admin/users",
      {
        params,
      },
    );

    return response.data;
  },

  getUser: async (userId: number) => {
    const response = await api.get<AdminUser>(
      `/admin/users/${userId}`,
    );

    return response.data;
  },

  changeRole: async (userId: number) => {
    const response = await api.patch<string>(
      `/admin/users/${userId}/roles`,
    );

    return response.data;
  },

  removeOwnerRole: async (userId: number) => {
    const response = await api.delete<string>(
      `/admin/users/${userId}/owner-role`,
    );

    return response.data;
  },

  /* =========================
     HOTELS
  ========================= */

  getHotels: async (
    params?: {
      search?: string;
      active?: boolean;
      page?: number;
      size?: number;
    },
  ) => {
    const response = await api.get<PageResponse<AdminHotel>>(
      "/admin/hotels",
      {
        params,
      },
    );

    return response.data;
  },

  getHotel: async (hotelId: number) => {
    const response = await api.get<AdminHotel>(
      `/admin/hotels/${hotelId}`,
    );

    return response.data;
  },

  activateHotel: async (hotelId: number) => {
    const response = await api.patch<string>(
      `/admin/hotels/${hotelId}/activate`,
    );

    return response.data;
  },

  suspendHotel: async (hotelId: number) => {
    const response = await api.patch<string>(
      `/admin/hotels/${hotelId}/suspend`,
    );

    return response.data;
  },

  deleteHotel: async (hotelId: number) => {
    const response = await api.delete<string>(
      `/admin/hotels/${hotelId}`,
    );

    return response.data;
  },

  /* =========================
     OWNER VERIFICATION
  ========================= */

  getPendingVerifications: async () => {
    const response = await api.get<OwnerVerification[]>(
      "/admin/owner-verifications/pending",
    );

    return response.data;
  },

  approveVerification: async (
    verificationId: number,
  ) => {
    const response = await api.put<string>(
      `/admin/owner-verifications/${verificationId}/approve`,
    );

    return response.data;
  },

  rejectVerification: async (
    verificationId: number,
    reason: string,
  ) => {
    const response = await api.put<string>(
      `/admin/owner-verifications/${verificationId}/reject`,
      {
        reason,
      },
    );

    return response.data;
  },

  /* =========================
     REVIEWS
  ========================= */

  getReviews: async (
    params?: {
      rating?: number;
      page?: number;
      size?: number;
    },
  ) => {
    const response = await api.get<PageResponse<AdminReview>>(
      "/admin/reviews",
      {
        params,
      },
    );

    return response.data;
  },

  getReview: async (reviewId: number) => {
    const response = await api.get<AdminReview>(
      `/admin/reviews/${reviewId}`,
    );

    return response.data;
  },

  deleteReview: async (reviewId: number) => {
    const response = await api.delete<string>(
      `/admin/reviews/${reviewId}`,
    );

    return response.data;
  },

  /* =========================
     REPORTS
  ========================= */

  getReports: async (
    params?: {
      status?: string;
      page?: number;
      size?: number;
    },
  ) => {
    const response = await api.get<PageResponse<AdminReport>>(
      "/admin/reports",
      {
        params,
      },
    );

    return response.data;
  },

  getReport: async (reportId: number) => {
    const response = await api.get<AdminReport>(
      `/admin/reports/${reportId}`,
    );

    return response.data;
  },

  resolveReport: async (reportId: number) => {
    const response = await api.patch<string>(
      `/admin/reports/${reportId}/resolve`,
    );

    return response.data;
  },

  dismissReport: async (reportId: number) => {
    const response = await api.patch<string>(
      `/admin/reports/${reportId}/dismiss`,
    );

    return response.data;
  },

  /* =========================
     ACTIVITY
  ========================= */

  getActivity: async (
    params?: {
      page?: number;
      size?: number;
    },
  ) => {
    const response = await api.get<PageResponse<AdminActivity>>(
      "/admin/activity",
      {
        params,
      },
    );

    return response.data;
  },

  /* =========================
     MAINTENANCE
  ========================= */

  reindex: async () => {
    const response = await api.get<string>(
      "/admin/reindex",
    );

    return response.data;
  },

  elasticsearchTest: async () => {
    const response = await api.get<string>(
      "/admin/es-test",
    );

    return response.data;
  },
};