// Conservative browser hints, not a hardware benchmark. Unsupported hints are ignored.
export function prefersEconomyRendering() {
  const device = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return device.connection?.saveData === true ||
    (device.hardwareConcurrency > 0 && device.hardwareConcurrency <= 4) ||
    (device.deviceMemory !== undefined && device.deviceMemory <= 4);
}
