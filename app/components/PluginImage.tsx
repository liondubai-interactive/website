import Image from "next/image";

export function PluginImage({ id }: { id: string }) {
  return <Image className="plugin-image" src={`/plugins/${id}.webp`} alt="" width={64} height={64} unoptimized />;
}
