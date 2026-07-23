"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getToken, paymentApi } from "../../../lib/api";
import { trackMetaEvent } from "../../../lib/metaPixel";

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="max-w-lg mx-auto px-4 py-24 text-center">
          Loading...
        </main>
      }
    >
      <PaymentCallbackInner />
    </Suspense>
  );
}

function PaymentCallbackInner() {
  const searchParams = useSearchParams();

  const reference =
    searchParams.get("reference") || searchParams.get("trxref");

  const [status, setStatus] = useState("checking");
  const [courseSlug, setCourseSlug] = useState(null);

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      return;
    }

    let cancelled = false;
    let timeoutId;

    const pendingCourseKey = `pwa_pending_${reference}`;
    const purchaseTrackedKey = `pwa_purchase_tracked_${reference}`;

    const slug = sessionStorage.getItem(pendingCourseKey);
    setCourseSlug(slug);

    const token = getToken();

    if (!token) {
      setStatus("error");
      return;
    }

    let attempts = 0;

    const trackPurchaseOnce = (paymentResult) => {
      const alreadyTracked =
        sessionStorage.getItem(purchaseTrackedKey) === "true";

      if (alreadyTracked) {
        return;
      }

      const purchaseData = {
        currency: paymentResult?.currency || "GHS",
        content_name: slug || "Piano With Aaron Course",
        content_type: "product",
        payment_reference: reference,
      };

      /*
       * Your backend may optionally return amountGhs.
       * We only send the value when it is a valid GHS amount.
       * This avoids accidentally sending Paystack's amount in pesewas.
       */
      const amountGhs = Number(paymentResult?.amountGhs);

      if (Number.isFinite(amountGhs) && amountGhs > 0) {
        purchaseData.value = amountGhs;
      }

      trackMetaEvent("Purchase", purchaseData);

      sessionStorage.setItem(purchaseTrackedKey, "true");
    };

    const poll = async () => {
      attempts += 1;

      try {
        const res = await paymentApi.verify(reference, token);

        if (cancelled) {
          return;
        }

        if (res.status === "SUCCESS") {
          trackPurchaseOnce(res);

          setStatus("success");
          sessionStorage.removeItem(pendingCourseKey);
          return;
        }

        if (res.status === "FAILED") {
          setStatus("failed");
          return;
        }

        if (attempts < 5) {
          timeoutId = setTimeout(poll, 2000);
          return;
        }

        setStatus("pending");
      } catch (err) {
        if (!cancelled) {
          console.error("Payment verification failed:", err);
          setStatus("error");
        }
      }
    };

    poll();

    return () => {
      cancelled = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [reference]);

  return (
    <main className="max-w-lg mx-auto px-4 py-24 text-center">
      {status === "checking" && (
        <>
          <h1 className="font-display text-2xl mb-3">
            Confirming your payment...
          </h1>

          <p className="opacity-70">
            This usually takes just a few seconds.
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <h1 className="font-display text-2xl mb-3">
            You&apos;re enrolled! 🎉
          </h1>

          <p className="opacity-70 mb-6">
            Your payment was successful and you now have full access.
          </p>

          <a
            href={courseSlug ? `/courses/${courseSlug}` : "/courses"}
            className="px-6 py-2.5 rounded-lg bg-gold text-ink font-semibold"
          >
            Start learning
          </a>
        </>
      )}

      {status === "pending" && (
        <>
          <h1 className="font-display text-2xl mb-3">
            Still processing
          </h1>

          <p className="opacity-70 mb-6">
            Your payment is being confirmed. Refresh this page in a minute
            to check again.
          </p>
        </>
      )}

      {status === "failed" && (
        <>
          <h1 className="font-display text-2xl mb-3">
            Payment didn&apos;t go through
          </h1>

          <p className="opacity-70 mb-6">
            No charge was completed. You can try again.
          </p>

          <a
            href={courseSlug ? `/courses/${courseSlug}` : "/courses"}
            className="px-6 py-2.5 rounded-lg border border-gold/40"
          >
            Back to course
          </a>
        </>
      )}

      {status === "error" && (
        <>
          <h1 className="font-display text-2xl mb-3">
            Something went wrong
          </h1>

          <p className="opacity-70 mb-6">
            We couldn&apos;t confirm this payment automatically. If you were
            charged, contact support with your reference:{" "}
            <code>{reference || "Not available"}</code>
          </p>
        </>
      )}
    </main>
  );
}
