module.exports = {
  apps: [
    {
      name: "tms-admin-be",
      script: "node_modules/.bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
