module.exports = {
  apps: [
    {
      name: "logistics-platform",
      script: "node_modules/.bin/next",
      args: "start -p 3020",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
