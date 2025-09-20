export declare function uploadToIpfs(pathOrBuffer: string | Buffer): Promise<string>;
export declare function sha256Hex(buf: Buffer): string;
export declare function cidToBytes(cidStr: string): Uint8Array;
export declare function computePHash64(pathOrBuffer: string | Buffer): Promise<string>;
export declare function buildDigest(sha256Hex: string, cidBytes: Uint8Array): string;
