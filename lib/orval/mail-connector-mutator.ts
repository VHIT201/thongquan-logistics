import Axios, { AxiosError, AxiosRequestConfig } from "axios"

const MAIL_CONNECTOR_BASE_URL =
  process.env.NEXT_PUBLIC_MAIL_CONNECTOR_API_URL ??
  "https://vietprodev.duckdns.org/gateway/mail-connector"

export const MAIL_CONNECTOR_AXIOS = Axios.create({
  baseURL: MAIL_CONNECTOR_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

MAIL_CONNECTOR_AXIOS.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

MAIL_CONNECTOR_AXIOS.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
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
