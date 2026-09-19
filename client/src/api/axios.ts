import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;

let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (
  error: unknown,
  token: string | null = null
) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as AxiosRequestConfig & {
        _retry?: boolean;
      };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isAuthRequest =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh");

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization =
                `Bearer ${token}`;
            }

            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
        }
      );

      const accessToken =
        response.data.accessToken;

      if (!accessToken) {
        throw new Error(
          "Refresh response did not contain an access token"
        );
      }

      localStorage.setItem(
        "accessToken",
        accessToken
      );

      processQueue(null, accessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization =
          `Bearer ${accessToken}`;
      }

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);

      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;