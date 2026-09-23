export const siteOrigin = "https://liondubai.net";

function release() {
  const url = process.env.NEXT_PUBLIC_WINDOWS_DOWNLOAD_URL?.trim();
  const version = process.env.NEXT_PUBLIC_WINDOWS_DOWNLOAD_VERSION?.trim();
  const checksum = process.env.NEXT_PUBLIC_WINDOWS_DOWNLOAD_SHA256?.trim();
  if (!url) return null;
  const parsed = new URL(url);
  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    !version ||
    !/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version) ||
    !checksum ||
    !/^[a-f0-9]{64}$/i.test(checksum)
  ) {
    throw new Error(
      "A Windows download requires an HTTPS release URL, version and SHA-256 checksum.",
    );
  }
  return { url: parsed.href, version, checksum };
}

export const windowsRelease = release();
