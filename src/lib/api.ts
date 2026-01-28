import axios from "axios";
import { toast } from "sonner";
import { ApiResponseDTO } from "../types/ApiResponse";
import { AuthenticationResponseDTO } from "@/types/Auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const authDetails: AuthenticationResponseDTO = JSON.parse(
      localStorage.getItem("auth_details")
    );
    const accessToken = authDetails?.accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error?.code === "ERR_CANCELED" ||
      error?.name === "CanceledError" ||
      error?.message === "canceled"
    ) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (error.response) {
      const { status, data } = error.response as {
        status: number;
        data: ApiResponseDTO<any>;
      };


      const isAuthPage = window.location.pathname.startsWith("/auth");

      if (status === 401) {
        if (originalRequest.url?.includes("/auth/v1/refresh")) {
          // Refresh token is invalid/expired
          localStorage.removeItem("auth_details");
          if (!isAuthPage) {
            toast.error("Session expired. Please login again.");
            window.location.href = "/auth/login";
          }
        } else {
          // Access token is invalid/expired
          const authDetails: AuthenticationResponseDTO = JSON.parse(
            localStorage.getItem("auth_details")
          );

          if (authDetails?.refreshToken) {
            try {
              const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}auth/v1/refresh`,
                { refreshToken: authDetails.refreshToken }
              );

              const accessToken = response.data.data;

              const oldAuthDetails: AuthenticationResponseDTO = JSON.parse(
                localStorage.getItem("auth_details") || "{}"
              );

              localStorage.setItem(
                "auth_details",
                JSON.stringify({
                  ...oldAuthDetails,
                  accessToken,
                })
              );

              // Retry the original request with new access token
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return axios(originalRequest);
            } catch (refreshError: any) {
              // Refresh token failed
              localStorage.removeItem("auth_details");
              if (!isAuthPage) {
                toast.error("Session expired. Please login again.");
                window.location.href = "/auth/login";
              }
              return Promise.reject(refreshError);
            }
          } else {
            // No refresh token, force logout
            localStorage.removeItem("auth_details");
            if (!isAuthPage) {
              window.location.href = "/auth/login";
            }
          }
        }
      } else if (status >= 400) {
        toast.error(data?.message || "An error occurred. Please try again.");
      }
    } else {
      toast.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  }
);

export default api;
