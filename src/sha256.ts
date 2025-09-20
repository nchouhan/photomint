import { createHash } from "crypto";
export function sha256Hex(buf: Buffer) {
  const h = createHash("sha256"); h.update(buf); return "0x" + h.digest("hex");
}
