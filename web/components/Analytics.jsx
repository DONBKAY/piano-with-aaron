"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  useEffect(() => {
    const query = searchParams?.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    if (typeof window === "undefined") {
      return;
    }

    if (gaId && typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: pagePath,
        page_location: window.location.href,
        page_title: document.title,
      });
    }

    if (typeof window.ttq?.page === "function") {
      window.ttq.page();
    }
  }, [pathname, searchParams, gaId]);

  return (
    <>
      {(gaId || googleAdsId) && (
        <>
          <Script
            id="google-tag-library"
            src={`https://www.googletagmanager.com/gtag/js?id=${
              gaId || googleAdsId
            }`}
            strategy="afterInteractive"
          />

          <Script id="google-tag-setup" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];

              function gtag() {
                window.dataLayer.push(arguments);
              }

              window.gtag = gtag;

              gtag("js", new Date());

              ${
                gaId
                  ? `gtag("config", "${gaId}", { send_page_view: false });`
                  : ""
              }

              ${
                googleAdsId
                  ? `gtag("config", "${googleAdsId}");`
                  : ""
              }
            `}
          </Script>
        </>
      )}

      {tiktokPixelId && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject = t;

              var ttq = w[t] = w[t] || [];

              ttq.methods = [
                "page",
                "track",
                "identify",
                "instances",
                "debug",
                "on",
                "off",
                "once",
                "ready",
                "alias",
                "group",
                "enableCookie",
                "disableCookie",
                "holdConsent",
                "revokeConsent",
                "grantConsent"
              ];

              ttq.setAndDefer = function (t, e) {
                t[e] = function () {
                  t.push([e].concat(
                    Array.prototype.slice.call(arguments, 0)
                  ));
                };
              };

              for (
                var i = 0;
                i < ttq.methods.length;
                i += 1
              ) {
                ttq.setAndDefer(ttq, ttq.methods[i]);
              }

              ttq.instance = function (t) {
                var e = ttq._i[t] || [];

                for (
                  var n = 0;
                  n < ttq.methods.length;
                  n += 1
                ) {
                  ttq.setAndDefer(e, ttq.methods[n]);
                }

                return e;
              };

              ttq.load = function (e, n) {
                var r = "https://analytics.tiktok.com/i18n/pixel/events.js";
                var o = n && n.partner;

                ttq._i = ttq._i || {};
                ttq._i[e] = [];
                ttq._i[e]._u = r;
                ttq._t = ttq._t || {};
                ttq._t[e] = +new Date();
                ttq._o = ttq._o || {};
                ttq._o[e] = n || {};

                var a = document.createElement("script");

                a.type = "text/javascript";
                a.async = true;
                a.src = r + "?sdkid=" + e + "&lib=" + t;

                var s = document.getElementsByTagName("script")[0];

                s.parentNode.insertBefore(a, s);
              };

              ttq.load("${tiktokPixelId}");
              ttq.page();
            }(window, document, "ttq");
          `}
        </Script>
      )}

      {clarityProjectId && (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c, l, a, r, i, t, y) {
              c[a] = c[a] || function() {
                (c[a].q = c[a].q || []).push(arguments);
              };

              t = l.createElement(r);
              t.async = 1;
              t.src = "https://www.clarity.ms/tag/" + i;

              y = l.getElementsByTagName(r)[0];
              y.parentNode.insertBefore(t, y);
            })(
              window,
              document,
              "clarity",
              "script",
              "${clarityProjectId}"
            );
          `}
        </Script>
      )}
    </>
  );
}
