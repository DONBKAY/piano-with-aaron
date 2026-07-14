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
      router.push("/login?next=/admin");
      return;
    }
    setAuthorized(true);
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-lg opacity-70">Checking administrator access...</p>
      </main>
    );
  }
  if (!authorized) return null;

  const menuItems = [
    { title: "Dashboard", href: "/admin", icon: "🏠" },
    { title: "Courses", href: "/admin/courses", icon: "📚" },
    { title: "New Course", href: "/admin/new", icon: "➕" },
    { title: "Students", href: "/admin/students", icon: "👨‍🎓" },
    { title: "Payments", href: "/admin/payments", icon: "💳" },
    { title: "Analytics", href: "/admin/analytics", icon: "📈" },
    { title: "Categories", href: "/admin/categories", icon: "🏷️" },
  ];

  return (
    <div className="flex min-h-screen bg-cream dark:bg-ink">
      {/* Sidebar */}
      <aside className="w-72 border-r border-gold/20 bg-white/60 dark:bg-deep/60">
        <div className="border-b border-gold/20 px-6 py-6">
          <h1 className="text-2xl font-bold font-display">Piano With Aaron</h1>
          <p className="text-sm opacity-60 mt-1">Admin Portal</p>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                  active
                    ? "bg-gold/20 text-ink dark:text-cream font-semibold"
                    : "hover:bg-gold/10"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            );
          })}
          <div className="border-t border-gold/20 my-6" />
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-gold/10 opacity-70"
          >
            <span>🌐</span>
            <span>Back to Website</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
    </div>
  );
}
