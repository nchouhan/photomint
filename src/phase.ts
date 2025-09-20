// src/phash.ts – simple DCT-based 64-bit pHash (grayscale, 32x32 → top-left 8x8)
import sharp from "sharp";

export async function pHash64(buf: Buffer): Promise<bigint> {
  const img = await sharp(buf).greyscale().resize(32, 32, { fit: "fill" }).raw().toBuffer();
  // 1D DCT helper
  const N = 32;
  const dct1 = (vec: number[]) => {
    const res = new Array(N).fill(0);
    for (let k = 0; k < N; k++) {
      let sum = 0;
      for (let n = 0; n < N; n++) sum += vec[n] * Math.cos((Math.PI / N) * (n + 0.5) * k);
      res[k] = sum;
    }
    return res;
  };
  // 2D DCT
  const px = Array.from(img);
  const mat = Array.from({ length: N }, (_, r) => px.slice(r * N, (r + 1) * N));
  const rows = mat.map(dct1);
  const cols = Array.from({ length: N }, (_, c) => dct1(rows.map(r => r[c])));
  // top-left 8x8 (skip DC at 0,0 when averaging)
  const block: number[] = [];
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) block.push(cols[x][y]);
  const mean = block.slice(1).reduce((a, b) => a + b, 0) / (block.length - 1);
  // build 64-bit hash
  let h = 0n;
  for (let i = 0; i < 64; i++) {
    h <<= 1n;
    if (block[i] > mean) h |= 1n;
  }
  return h;
}
