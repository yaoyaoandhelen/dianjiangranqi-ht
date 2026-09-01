import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const requiredFiles = ["app.js", "data.js"];

for (const file of requiredFiles) {
  const target = resolve("dist", file);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(resolve(file), target);
}
