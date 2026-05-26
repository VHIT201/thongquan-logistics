import { defineConfig } from "orval"

export default defineConfig({
  mailConnector: {
    input: {
      target: "https://vietprodev.duckdns.org/gateway/logistics/swagger/v1/swagger.json",
    },
    output: {
      mode: "split",
      target: "./lib/generated/mail-connector/endpoints.ts",
      schemas: "./lib/generated/mail-connector/model",
      client: "axios",
      clean: true,
      override: {
        mutator: {
          path: "./lib/orval/mail-connector-mutator.ts",
          name: "mailConnectorInstance",
        },
      },
    },
  },
})
