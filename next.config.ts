import type { NextConfig } from "next";

const repositoryName = "website";

const nextConfig: NextConfig = {
  basePath: `/${repositoryName}`,
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
