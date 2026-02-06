import { BIN, VERSION } from "@yume-chan/fetch-scrcpy-server";

export async function loadScrcpyServerBuffer(): Promise<Uint8Array> {
  const response = await fetch(BIN);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

export { VERSION as SCRCPY_SERVER_VERSION };
