import { Adb, AdbDaemonTransport } from "@yume-chan/adb";
import {
  AdbDaemonWebUsbDeviceManager,
  type AdbDaemonWebUsbDevice,
} from "@yume-chan/adb-daemon-webusb";
import { getCredentialStore } from "./credential-store.js";
import type { DeviceInfo } from "../../types/index.js";

export class DeviceManager {
  private manager: AdbDaemonWebUsbDeviceManager | undefined;
  private device: AdbDaemonWebUsbDevice | undefined;
  private transport: AdbDaemonTransport | undefined;
  private _adb: Adb | undefined;

  constructor() {
    this.manager = AdbDaemonWebUsbDeviceManager.BROWSER;
  }

  get isSupported(): boolean {
    return this.manager !== undefined;
  }

  get adb(): Adb | undefined {
    return this._adb;
  }

  get connected(): boolean {
    return this._adb !== undefined;
  }

  async requestDevice(): Promise<AdbDaemonWebUsbDevice | undefined> {
    if (!this.manager) throw new Error("WebUSB not supported");
    this.device = await this.manager.requestDevice();
    return this.device;
  }

  async connect(): Promise<Adb> {
    if (!this.device) throw new Error("No device selected");

    const connection = await this.device.connect();
    const credentialStore = getCredentialStore();

    this.transport = await AdbDaemonTransport.authenticate({
      serial: this.device.serial,
      connection,
      credentialStore,
    });

    this._adb = new Adb(this.transport);
    return this._adb;
  }

  get disconnected(): Promise<void> | undefined {
    return this.transport?.disconnected;
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    if (!this._adb) throw new Error("Not connected");

    const run = async (cmd: string[]) => {
      const result = await this._adb!.subprocess.noneProtocol.spawnWaitText(cmd);
      return result.trim();
    };

    const [model, androidVersion, serial] = await Promise.all([
      run(["getprop", "ro.product.model"]),
      run(["getprop", "ro.build.version.release"]),
      run(["getprop", "ro.serialno"]),
    ]);

    return { model, androidVersion, serial };
  }

  async disconnect(): Promise<void> {
    try {
      await this._adb?.close();
    } catch {
      // Ignore errors during disconnect
    }
    this._adb = undefined;
    this.transport = undefined;
    this.device = undefined;
  }
}
