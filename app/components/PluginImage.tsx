import Image from "next/image";

export function PluginImage({ id, large = false }: { id: string; large?: boolean }) {
  const size = large ? 640 : 64;
  return <Image className="plugin-image" src={`/plugins/${id}${large ? "-card" : ""}.webp`} alt="" width={size} height={size} unoptimized />;
}
