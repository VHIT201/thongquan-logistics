import Axios, { AxiosError, AxiosRequestConfig } from "axios"
import { RefreshTokenCommand } from "@/lib/generated/mail-connector/model"
import { useAuthStore } from "@/lib/stores/auth-store"

const MAIL_CONNECTOR_BASE_URL =
  process.env.NEXT_PUBLIC_MAIL_CONNECTOR_API_URL ??
  "https://vietprodev.duckdns.org/gateway/logistics"

// Separate axios instance without interceptors for refresh token to avoid loop
const REFRESH_AXIOS = Axios.create({
  baseURL: MAIL_CONNECTOR_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export const MAIL_CONNECTOR_AXIOS = Axios.create({
  baseURL: MAIL_CONNECTOR_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken))
  refreshSubscribers = []
}

async function doRefreshToken() {
  const refreshToken = localStorage.getItem("refreshToken")
  if (!refreshToken) throw new Error("No refresh token")

  const refreshTokenCommand: RefreshTokenCommand = { refreshToken }

  // Use Orval-generated model but direct axios call to avoid interceptor loop
  const res = await REFRESH_AXIOS.post<{ accessToken?: string; refreshToken?: string }>(
    "/api/v1/auth/refresh",
    refreshTokenCommand
  )

  const data = res.data
  if (!data?.accessToken) throw new Error("Refresh failed: no accessToken in response")

  localStorage.setItem("token", data.accessToken)
  if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken)
  return data.accessToken
}

MAIL_CONNECTOR_AXIOS.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

MAIL_CONNECTOR_AXIOS.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (typeof window === "undefined") {
      return Promise.reject(error)
    }

    // Skip refresh if user is not logged in (no token) — e.g., login page
    const token = localStorage.getItem("token")
    if (!token) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          resolve(MAIL_CONNECTOR_AXIOS(originalRequest))
        })
      })
    }

    isRefreshing = true

    try {
      const newToken = await doRefreshToken()
      onTokenRefreshed(newToken)
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
      }
      return MAIL_CONNECTOR_AXIOS(originalRequest)
    } catch {
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("userId")
      useAuthStore.getState().clearAuth()
      window.location.href = "/login"
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)

export const mailConnectorInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  return MAIL_CONNECTOR_AXIOS({
    ...config,
    ...options,
  }).then(({ data }) => data)
}

export type ErrorType<Error> = AxiosError<Error>
export type BodyType<BodyData> = BodyData
