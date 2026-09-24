import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function nextConfig(phase: string): NextConfig {
  const development = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    ...(development ? {} : { output: "export" }),
    trailingSlash: true,
    pageExtensions: development ? ["dev.ts", "tsx", "ts", "jsx", "js"] : ["tsx", "ts", "jsx", "js"],
  };
}
