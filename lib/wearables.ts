export type WearablePlatform =
  | 'appleWatch'
  | 'wearOS'
  | 'healthConnect'
  | 'healthKit';

export interface WearableNotificationPayload {
  title: string;
  message: string;
  scheduledAt?: string;
}

export interface WearableHeartRateSample {
  bpm: number;
  recordedAt: string;
}

export interface WearableBridge {
  platform: WearablePlatform;
  isAvailable: () => Promise<boolean>;
  sendNotification: (payload: WearableNotificationPayload) => Promise<void>;
  readLatestHeartRate: () => Promise<WearableHeartRateSample | null>;
}

async function notImplemented(name: string): Promise<void> {
  console.warn(`${name} is a foundation stub and not implemented yet.`);
}

function createStubBridge(platform: WearablePlatform): WearableBridge {
  return {
    platform,
    isAvailable: async () => false,
    sendNotification: async () => notImplemented(`${platform}.sendNotification`),
    readLatestHeartRate: async () => {
      await notImplemented(`${platform}.readLatestHeartRate`);
      return null;
    },
  };
}

export const appleWatchBridge = createStubBridge('appleWatch');
export const wearOSBridge = createStubBridge('wearOS');
export const healthConnectBridge = createStubBridge('healthConnect');
export const healthKitBridge = createStubBridge('healthKit');

export const wearableBridges: WearableBridge[] = [
  appleWatchBridge,
  wearOSBridge,
  healthConnectBridge,
  healthKitBridge,
];

export async function getAvailableWearableBridges(): Promise<WearableBridge[]> {
  const checks = await Promise.all(
    wearableBridges.map(async (bridge) => ({
      bridge,
      available: await bridge.isAvailable(),
    }))
  );

  return checks.filter((item) => item.available).map((item) => item.bridge);
}
