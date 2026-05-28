import { onBeforeUnmount, onMounted, shallowRef } from "vue";

const DEVICE_QUERY = "(max-width: 1280px)";

export function useUnsupportedDevice() {
  const isUnsupportedDevice = shallowRef(false);

  let mediaQueryList = null;
  let removeListener = null;

  const updateState = (matches) => {
    isUnsupportedDevice.value = matches;
  };

  onMounted(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    mediaQueryList = window.matchMedia(DEVICE_QUERY);
    updateState(mediaQueryList.matches);

    const handleChange = (event) => {
      updateState(event.matches);
    };

    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", handleChange);
      removeListener = () => mediaQueryList?.removeEventListener("change", handleChange);
      return;
    }

    mediaQueryList.addListener(handleChange);
    removeListener = () => mediaQueryList?.removeListener(handleChange);
  });

  onBeforeUnmount(() => {
    removeListener?.();
  });

  return {
    isUnsupportedDevice,
  };
}
