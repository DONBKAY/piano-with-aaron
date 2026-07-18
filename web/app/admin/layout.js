"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getToken } from "../../lib/api";
import { decodeToken } from "../../lib/adminApi";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [checked, setChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = getToken();
    const payload = token ? decodeToken(token) : null;

    if (!payload || payload.role !== "ADMIN") {
      setAuthorized(false);
      setChecked(true);
      router.replace("/login?next=/admin");
      return;
    }

    setAuthorized(true);
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream dark:bg-ink">
        <p className="text-lg opacity-70">
          Checking administrator access...
        </p>
      </main>
    );
  }

  if (!authorized) {
    return null;
  }

  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: "🏠",
    },
    {
      title: "Courses",
      href: "/admin/courses",
      icon: "📚",
    },
    {
      title: "New Course",
      href: "/admin/new",
      icon: "➕",
    },
    {
      title: "Students",
      href: "/admin/students",
      icon: "👨‍🎓",
    },
    {
      title: "Administrators",
      href: "/admin/admins",
      icon: "🛡️",
    },
    {
      title: "Payments",
      href: "/admin/payments",
      icon: "💳",
    },
    {
      title: "Reviews",
      href: "/admin/reviews",
      icon: "⭐",
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: "📈",
    },
    {
      title: "Categories",
      href: "/admin/categories",
      icon: "🏷️",
    },
  ];

  function isMenuItemActive(href) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="flex min-h-screen bg-cream dark:bg-ink">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-gold/20 bg-white/60 md:block dark:bg-deep/60">
        <div className="border-b border-gold/20 px-6 py-6">
          <Link href="/admin">
            <h1 className="font-display text-2xl font-bold">
              Piano With Aaron
            </h1>
          </Link>

          <p className="mt-1 text-sm opacity-60">Admin Portal</p>
        </div>

        <nav className="space-y-2 p-4">
          {menuItems.map((item) => {
            const active = isMenuItemActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                  active
                    ? "bg-gold/20 font-semibold text-ink dark:text-cream"
                    : "hover:bg-gold/10"
                }`}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            );
          })}

          <div className="my-6 border-t border-gold/20" />

          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-4 py-3 opacity-70 transition hover:bg-gold/10 hover:opacity-100"
          >
            <span aria-hidden="true">🌐</span>
            <span>Back to Website</span>
          </Link>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-gold/20 bg-white/70 px-4 py-4 backdrop-blur md:hidden dark:bg-deep/70">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-xl font-bold">
                Piano With Aaron
              </h1>
              <p className="text-xs opacity-60">Admin Portal</p>
            </div>

            <Link
              href="/"
              className="rounded-lg border border-gold/30 px-3 py-2 text-sm"
            >
              Website
            </Link>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {menuItems.map((item) => {
              const active = isMenuItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                    active
                      ? "bg-gold/20 font-semibold"
                      : "bg-gold/5"
                  }`}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
