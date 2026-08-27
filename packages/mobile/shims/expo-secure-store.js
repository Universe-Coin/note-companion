/** iOS 26: no-op stub — real SecureStore TurboModule hangs at init in production. */
const noopAsync = async () => {};

module.exports = {
  AFTER_FIRST_UNLOCK: 0,
  WHEN_UNLOCKED: 1,
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 2,
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: 3,
  ALWAYS: 4,
  ALWAYS_THIS_DEVICE_ONLY: 5,
  getItemAsync: async () => null,
  setItemAsync: noopAsync,
  deleteItemAsync: noopAsync,
  isAvailableAsync: async () => false,
};
