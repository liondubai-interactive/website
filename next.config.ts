import type { NextConfig } from "next";

import { siteBasePath } from "./app/site-config";

const nextConfig: NextConfig = {
  basePath: siteBasePath,
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
