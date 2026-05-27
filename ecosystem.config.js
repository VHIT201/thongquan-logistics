module.exports = {
  apps: [
    {
      name: "logistics-platform",
      script: "node_modules/.bin/next",
      args: "start -p 3056",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
