import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Giữ nguyên để bỏ qua check type khi build trên CI/CD
    ignoreBuildErrors: true,
  },
  // Xóa mục 'eslint' ở đây, thay vào đó bạn có thể chạy 'pnpm lint' ở một job riêng nếu cần
};

export default nextConfig;
