import api from "./axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export const authApi = {
  login(data: LoginRequest) {
    return api.post("/auth/login", data);
  },

  signup(data: SignupRequest) {
    return api.post("/auth/signup", data);
  },

  refresh() {
    return api.post("/auth/refresh");
  },

  logout() {
    return api.post("/auth/logout");
  },

  me() {
    return api.get("/auth/me");
  },
};