module.exports = {
  apps: [
    {
      name: "logistics-platform",
      script: "pnpm", 
      args: "start",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};