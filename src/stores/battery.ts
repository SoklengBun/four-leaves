import { ref } from 'vue';
import { defineStore } from 'pinia';

interface BatteryManagerLike {
  level: number;
  addEventListener?: (type: 'levelchange', listener: () => void) => void;
}

type NavigatorWithBattery = Navigator & {
  getBattery?: () => Promise<BatteryManagerLike>;
};

export const useBattery = defineStore('battery', () => {
  const batteryPercentage = ref(100);
  const isBatterySupported = ref(true);

  let batteryManager: BatteryManagerLike | null = null;
  let isBatteryListenerAttached = false;

  const updateBatteryLevel = () => {
    if (!batteryManager) return;
    batteryPercentage.value = Math.round(batteryManager.level * 100);
  };

  const initBattery = async () => {
    if (typeof navigator === 'undefined') {
      isBatterySupported.value = false;
      return;
    }

    const batteryNavigator = navigator as NavigatorWithBattery;
    if (!batteryNavigator.getBattery) {
      isBatterySupported.value = false;
      return;
    }

    isBatterySupported.value = true;

    if (!batteryManager) {
      batteryManager = await batteryNavigator.getBattery();
    }

    updateBatteryLevel();

    if (!isBatteryListenerAttached) {
      batteryManager.addEventListener?.('levelchange', updateBatteryLevel);
      isBatteryListenerAttached = true;
    }
  };

  const refreshBattery = async () => {
    await initBattery();
  };

  return {
    batteryPercentage,
    isBatterySupported,
    initBattery,
    refreshBattery,
  };
});
