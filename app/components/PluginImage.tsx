import Image from "next/image";

export function PluginImage({ src, large = false }: { src: string; large?: boolean }) {
  const size = large ? 640 : 64;
  return <Image className="plugin-image" src={src} alt="" width={size} height={size} unoptimized />;
}
