export function trackMetaEvent(
  eventName,
  parameters = {},
  options = {}
) {
  if (
    typeof window === "undefined" ||
    typeof window.fbq !== "function"
  ) {
    return;
  }

  window.fbq(
    "track",
    eventName,
    parameters,
    options
  );
}

export function trackCustomMetaEvent(
  eventName,
  parameters = {},
  options = {}
) {
  if (
    typeof window === "undefined" ||
    typeof window.fbq !== "function"
  ) {
    return;
  }

  window.fbq(
    "trackCustom",
    eventName,
    parameters,
    options
  );
}
