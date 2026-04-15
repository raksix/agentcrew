import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  outputFileTracingRoot: '/root/.openclaw/workspace/agentcrew/law-firm-website',
};

export default withNextIntl(nextConfig);