import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function nextConfig(phase: string): NextConfig {
  const development = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    ...(development ? {} : { output: "export" }),
    trailingSlash: true,
    pageExtensions: development ? ["dev.ts", "tsx", "ts", "jsx", "js"] : ["tsx", "ts", "jsx", "js"],
    // Production uses public/_headers; serve the same encoded assets in local previews.
    ...(development ? { async headers() {
      return [{ source: "/models/encoded/:file", headers: [
        { key: "Content-Type", value: "model/gltf-binary" },
        { key: "Content-Encoding", value: "gzip" },
      ] }];
    } } : {}),
  };
}
