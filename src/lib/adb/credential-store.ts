import AdbWebCredentialStore from "@yume-chan/adb-credential-web";

let instance: AdbWebCredentialStore | null = null;

export function getCredentialStore(): AdbWebCredentialStore {
  if (!instance) {
    instance = new AdbWebCredentialStore("AndroidScreenController");
  }
  return instance;
}
