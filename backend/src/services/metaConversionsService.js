const crypto = require("crypto");

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function sha256(value) {
  const normalizedValue = normalize(value);

  if (!normalizedValue) {
    return undefined;
  }

  return crypto
    .createHash("sha256")
    .update(normalizedValue)
    .digest("hex");
}

function removeUndefined(object) {
  return Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );
}

function getMetaApiVersion() {
  return process.env.META_API_VERSION || "v24.0";
}

function getFrontendUrl() {
  return (
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    "https://www.pianowithaaron.com"
  ).replace(/\/$/, "");
}

async function sendMetaPurchaseEvent({
  reference,
  amount,
  currency,
  user,
  course,
  clientIpAddress,
  clientUserAgent,
  fbp,
  fbc,
}) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken =
    process.env.META_CONVERSIONS_API_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn(
      "Meta Conversions API skipped: META_PIXEL_ID or META_CONVERSIONS_API_TOKEN is missing"
    );

    return {
      skipped: true,
    };
  }

  const numericAmount = Number(amount);

  if (
    !reference ||
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0
  ) {
    throw new Error(
      "Invalid Meta Purchase event information"
    );
  }

  const userData = removeUndefined({
    em: user?.email ? [sha256(user.email)] : undefined,

    external_id: user?.id
      ? [sha256(String(user.id))]
      : undefined,

    fn: user?.name
      ? [sha256(user.name.split(/\s+/)[0])]
      : undefined,

    ln:
      user?.name?.split(/\s+/).length > 1
        ? [
            sha256(
              user.name
                .split(/\s+/)
                .slice(1)
                .join(" ")
            ),
          ]
        : undefined,

    client_ip_address: clientIpAddress,
    client_user_agent: clientUserAgent,
    fbp,
    fbc,
  });

  const eventSourceUrl = course?.slug
    ? `${getFrontendUrl()}/courses/${course.slug}`
    : `${getFrontendUrl()}/courses`;

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),

        // Must match the browser Pixel eventID.
        event_id: reference,

        action_source: "website",
        event_source_url: eventSourceUrl,

        user_data: userData,

        custom_data: {
          currency: String(currency || "GHS").toUpperCase(),
          value: numericAmount,
          content_ids: course?.id
            ? [String(course.id)]
            : undefined,
          content_name:
            course?.title ||
            "Piano With Aaron Course",
          content_type: "product",
          order_id: reference,
          num_items: 1,
        },
      },
    ],
  };

  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code =
      process.env.META_TEST_EVENT_CODE;
  }

  const endpoint =
    `https://graph.facebook.com/` +
    `${getMetaApiVersion()}/` +
    `${pixelId}/events`;

  const response = await fetch(endpoint, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },

    body: JSON.stringify(payload),
  });

  const responseBody = await response.json();

  if (!response.ok) {
    const message =
      responseBody?.error?.message ||
      "Meta Conversions API request failed";

    const error = new Error(message);
    error.metaResponse = responseBody;

    throw error;
  }

  console.log("Meta CAPI Purchase sent:", {
    reference,
    eventsReceived:
      responseBody?.events_received,
    traceId: responseBody?.fbtrace_id,
  });

  return responseBody;
}

module.exports = {
  sendMetaPurchaseEvent,
};
