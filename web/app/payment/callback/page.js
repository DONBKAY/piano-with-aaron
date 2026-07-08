"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getToken, paymentApi } from "../../../lib/api";

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<main className="max-w-lg mx-auto px-4 py-24 text-center">Loading...</main>}>
      <PaymentCallbackInner />
    </Suspense>
  );
}

function PaymentCallbackInner() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const [status, setStatus] = useState("checking"); // checking | success | failed | pending | error
  const [courseSlug, setCourseSlug] = useState(null);

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      return;
    }

    const slug = sessionStorage.getItem(`pwa_pending_${reference}`);
    setCourseSlug(slug);

    const token = getToken();
    if (!token) {
      setStatus("error");
      return;
    }

    // Poll a few times — the webhook may finalize the payment slightly
    // before or after this verify call lands.
    let attempts = 0;
    const poll = async () => {
      attempts += 1;
      try {
        const res = await paymentApi.verify(reference, token);
        if (res.status === "SUCCESS") {
          setStatus("success");
          sessionStorage.removeItem(`pwa_pending_${reference}`);
        } else if (res.status === "FAILED") {
          setStatus("failed");
        } else if (attempts < 5) {
          setTimeout(poll, 2000);
        } else {
          setStatus("pending");
        }
      } catch (err) {
        setStatus("error");
      }
    };

    poll();
  }, [reference]);

  return (
    <main className="max-w-lg mx-auto px-4 py-24 text-center">
      {status === "checking" && (
        <>
          <h1 className="font-display text-2xl mb-3">Confirming your payment...</h1>
          <p className="opacity-70">This usually takes just a few seconds.</p>
        </>
      )}
      {status === "success" && (
        <>
          <h1 className="font-display text-2xl mb-3">You're enrolled! 🎉</h1>
          <p className="opacity-70 mb-6">Your payment was successful and you now have full access.</p>
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
          <h1 className="font-display text-2xl mb-3">Still processing</h1>
          <p className="opacity-70 mb-6">
            Your payment is being confirmed. This page will update automatically once it's
            done — you can also refresh in a minute.
          </p>
        </>
      )}
      {status === "failed" && (
        <>
          <h1 className="font-display text-2xl mb-3">Payment didn't go through</h1>
          <p className="opacity-70 mb-6">No charge was completed. You can try again.</p>
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
          <h1 className="font-display text-2xl mb-3">Something went wrong</h1>
          <p className="opacity-70 mb-6">
            We couldn't confirm this payment automatically. If you were charged, contact support
            with your reference: <code>{reference}</code>
          </p>
        </>
      )}
    </main>
  );
}
