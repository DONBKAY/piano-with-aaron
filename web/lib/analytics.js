function isBrowser() {
  return typeof window !== "undefined";
}

function cleanObject(values = {}) {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );
}

export function trackGoogleEvent(eventName, parameters = {}) {
  if (!isBrowser() || typeof window.gtag !== "function") {
    return;
  }

  window.gtag(
    "event",
    eventName,
    cleanObject(parameters)
  );
}

export function trackGoogleAdsConversion({
  label,
  value,
  currency = "GHS",
  transactionId,
}) {
  if (!isBrowser() || typeof window.gtag !== "function") {
    return;
  }

  const googleAdsId =
    process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

  if (!googleAdsId || !label) {
    return;
  }

  window.gtag("event", "conversion", {
    send_to: `${googleAdsId}/${label}`,
    ...cleanObject({
      value,
      currency,
      transaction_id: transactionId,
    }),
  });
}

export function trackTikTokEvent(eventName, parameters = {}) {
  if (!isBrowser() || typeof window.ttq?.track !== "function") {
    return;
  }

  window.ttq.track(
    eventName,
    cleanObject(parameters)
  );
}

export function trackClarityEvent(eventName) {
  if (!isBrowser() || typeof window.clarity !== "function") {
    return;
  }

  window.clarity("event", eventName);
}

export function trackRegistrationAnalytics() {
  trackGoogleEvent("sign_up", {
    method: "email",
  });

  trackGoogleAdsConversion({
    label:
      process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL,
  });

  trackTikTokEvent("CompleteRegistration", {
    content_name: "Piano With Aaron Account",
  });

  trackClarityEvent("complete_registration");
}

export function trackCheckoutAnalytics({
  courseId,
  courseTitle,
  category,
  value,
  currency = "GHS",
}) {
  const safeValue = Number(value) || 0;

  trackGoogleEvent("begin_checkout", {
    currency,
    value: safeValue,
    items: [
      {
        item_id: String(courseId),
        item_name: courseTitle,
        item_category: category || "Piano Course",
        price: safeValue,
        quantity: 1,
      },
    ],
  });

  trackGoogleAdsConversion({
    label:
      process.env.NEXT_PUBLIC_GOOGLE_ADS_CHECKOUT_LABEL,
    value: safeValue,
    currency,
  });

  trackTikTokEvent("InitiateCheckout", {
    content_id: String(courseId),
    content_name: courseTitle,
    content_type: "product",
    quantity: 1,
    value: safeValue,
    currency,
  });

  trackClarityEvent("initiate_checkout");
}

export function trackPurchaseAnalytics({
  reference,
  courseId,
  courseTitle,
  value,
  currency = "GHS",
}) {
  const safeValue = Number(value) || 0;

  trackGoogleEvent("purchase", {
    transaction_id: reference,
    currency,
    value: safeValue,
    items: [
      {
        item_id: String(courseId || courseTitle || "course"),
        item_name: courseTitle || "Piano With Aaron Course",
        price: safeValue,
        quantity: 1,
      },
    ],
  });

  trackGoogleAdsConversion({
    label:
      process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL,
    value: safeValue,
    currency,
    transactionId: reference,
  });

  trackTikTokEvent("CompletePayment", {
    content_id: String(courseId || reference),
    content_name:
      courseTitle || "Piano With Aaron Course",
    content_type: "product",
    quantity: 1,
    value: safeValue,
    currency,
  });

  trackClarityEvent("purchase");
}
