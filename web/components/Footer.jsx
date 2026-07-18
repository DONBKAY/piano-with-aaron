import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gold/20 bg-deep text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-wide"
          >
            PIANO WITH AARON
          </Link>

          <p className="mt-4 max-w-sm text-sm leading-6 text-cream/70">
            Learn piano through structured online courses designed to
            help beginners, intermediate players and advanced students
            grow with confidence.
          </p>

          <p className="mt-4 text-sm font-semibold text-gold">
            Master the Piano. Inspire the World.
          </p>
        </div>

        <div>
          <h2 className="font-display text-lg font-bold">Explore</h2>

          <nav className="mt-4 flex flex-col gap-3 text-sm text-cream/70">
            <Link href="/" className="transition hover:text-gold">
              Home
            </Link>

            <Link
              href="/courses"
              className="transition hover:text-gold"
            >
              Courses
            </Link>

            <Link href="/about" className="transition hover:text-gold">
              About
            </Link>

            <Link
              href="/contact"
              className="transition hover:text-gold"
            >
              Contact
            </Link>
          </nav>
        </div>

        <div>
          <h2 className="font-display text-lg font-bold">Students</h2>

          <nav className="mt-4 flex flex-col gap-3 text-sm text-cream/70">
            <Link
              href="/dashboard"
              className="transition hover:text-gold"
            >
              My Dashboard
            </Link>

            <Link
              href="/my-courses"
              className="transition hover:text-gold"
            >
              My Courses
            </Link>

            <Link href="/login" className="transition hover:text-gold">
              Log In
            </Link>

            <Link href="/signup" className="transition hover:text-gold">
              Sign Up
            </Link>
          </nav>
        </div>

        <div>
          <h2 className="font-display text-lg font-bold">
            Follow Piano With Aaron
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="#"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 transition hover:border-gold hover:bg-gold hover:text-ink"
            >
              F
            </a>

            <a
              href="#"
              aria-label="YouTube"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 transition hover:border-gold hover:bg-gold hover:text-ink"
            >
              Y
            </a>

            <a
              href="#"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 transition hover:border-gold hover:bg-gold hover:text-ink"
            >
              I
            </a>

            <a
              href="#"
              aria-label="TikTok"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 transition hover:border-gold hover:bg-gold hover:text-ink"
            >
              T
            </a>
          </div>

          <p className="mt-5 text-sm leading-6 text-cream/70">
            Connect with us for piano lessons, course updates and
            student support.
          </p>
        </div>
      </div>

      <div className="border-t border-gold/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Piano With Aaron. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/privacy"
              className="transition hover:text-gold"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-gold"
            >
              Terms of Service
            </Link>

            <Link
              href="/refund-policy"
              className="transition hover:text-gold"
            >
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
