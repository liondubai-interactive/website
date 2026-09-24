import { readFile, mkdir, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

// HTTP compression only: the browser reconstructs exactly the original GLB bytes.
const models = new URL("../public/models/", import.meta.url);
await mkdir(new URL("encoded/", models), { recursive: true });
for (const name of ["hero-v31.glb", "brand-symbol-v1.glb"]) {
  const source = await readFile(new URL(name, models));
  const encoded = gzipSync(source, { level: 9 });
  await writeFile(new URL(`encoded/${name}`, models), encoded);
  console.log(`${name}: ${source.length} -> ${encoded.length} bytes`);
}
