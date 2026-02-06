import type { Adb } from "@yume-chan/adb";
import { AdbScrcpyClient, AdbScrcpyExitedError } from "@yume-chan/adb-scrcpy";
import { DefaultServerPath } from "@yume-chan/scrcpy";
import { ReadableStream, WritableStream } from "@yume-chan/stream-extra";
import { loadScrcpyServerBuffer } from "./server-binary.js";
import { buildScrcpyOptions } from "./options.js";
import type { ScrcpyConfig } from "../../types/index.js";
import { DEFAULT_SCRCPY_CONFIG } from "../../types/index.js";

export class ScrcpySessionManager {
  private adb: Adb;
  private _client: AdbScrcpyClient<any> | undefined;

  constructor(adb: Adb) {
    this.adb = adb;
  }

  get client() {
    return this._client;
  }

  async pushServer(): Promise<void> {
    const serverBinary = await loadScrcpyServerBuffer();
    await AdbScrcpyClient.pushServer(
      this.adb,
      new ReadableStream({
        start(controller) {
          controller.enqueue(serverBinary);
          controller.close();
        },
      })
    );
  }

  async start(config: ScrcpyConfig = DEFAULT_SCRCPY_CONFIG) {
    const options = buildScrcpyOptions(config);

    try {
      this._client = await AdbScrcpyClient.start(
        this.adb,
        DefaultServerPath,
        options
      );
    } catch (e) {
      if (e instanceof AdbScrcpyExitedError) {
        console.error("Scrcpy server exited:", e.output);
        throw new Error(`Scrcpy server failed:\n${e.output.join("\n")}`);
      }
      throw e;
    }

    // CRITICAL: Always consume the output stream to prevent blocking
    void this._client.output
      .pipeTo(
        new WritableStream({
          write(chunk) {
            console.debug("[scrcpy-server]", chunk);
          },
        })
      )
      .catch(() => {});

    return this._client;
  }

  async stop(): Promise<void> {
    try {
      await this._client?.close();
    } catch {
      // Ignore errors during stop
    }
    this._client = undefined;
  }
}
