import axios from "axios"

type ApiErrorShape = {
  errors?: Array<{ message?: string }>
  message?: string
}

export function getErrorMessage(error: unknown, fallback = "Đã có lỗi xảy ra"): string {
  if (axios.isAxiosError<ApiErrorShape>(error)) {
    const firstApiError = error.response?.data?.errors?.[0]?.message
    if (firstApiError) return firstApiError
    if (typeof error.response?.data?.message === "string") return error.response.data.message
    if (error.message) return error.message
  }

  if (error instanceof Error && error.message) return error.message
  return fallback
}
