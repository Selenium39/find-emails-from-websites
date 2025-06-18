import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Docker 部署配置
  output: 'standalone',
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
