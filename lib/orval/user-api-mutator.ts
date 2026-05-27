import { MAIL_CONNECTOR_AXIOS } from "./mail-connector-mutator"
import type { AxiosError, AxiosRequestConfig } from "axios"

export const userApiInstance = <T>(
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
