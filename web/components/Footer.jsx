import Link from "next/link";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://web.facebook.com/profile.php?id=61563689993012",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M13.5 22v-9h3l.5-3.5h-3.5V7.3c0-1 .3-1.8 1.8-1.8H17V2.4c-.5-.1-1.5-.2-2.7-.2-2.7 0-4.6 1.7-4.6 4.8v2.5H7V13h2.7v9h3.8Z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@PIANOTUTORIALS-GH",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/233248632153",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.6 4.1 1.6 5.9L.2 24l6.5-1.7a11.8 11.8 0 0 0 5.4 1.4h.1C18.7 23.7 24 18.4 24 11.9c0-3.2-1.2-6.1-3.5-8.4ZM12.2 21.7h-.1a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.8 9.8 0 1 1 8.5 4.7Zm5.4-7.4c-.3-.1-1.8-.9-2.1-1-.3-.1-.5-.1-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-1.7-.8-2.9-1.5-4-3.4-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.6l-1-2.3c-.3-.7-.6-.6-.9-.6h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.7 5.9 5.2.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.2-.6-.4Z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gold/20 bg-deep text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-3 font-display text-xl font-bold tracking-wide"
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
              >
                <path
                  d="M9 18V5l11-2v13M9 9l11-2M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm11-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <span>PIANO WITH AARON</span>
          </Link>

          <p className="mt-4 max-w-sm text-sm leading-6 text-cream/70">
            Learn gospel piano through structured online courses
            designed to help you understand chords, play by ear and
            become a confident independent pianist.
          </p>

          <p className="mt-4 text-sm font-semibold text-gold">
            Master Gospel Piano with Confidence.
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

            <Link
              href="/about"
              className="transition hover:text-gold"
            >
              About Aaron
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

            <Link
              href="/login"
              className="transition hover:text-gold"
            >
              Log In
            </Link>

            <Link
              href="/signup"
              className="transition hover:text-gold"
            >
              Sign Up
            </Link>
          </nav>
        </div>

        <div>
          <h2 className="font-display text-lg font-bold">
            Follow Piano With Aaron
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit Piano With Aaron on ${social.name}`}
                title={social.name}
                className="group flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 text-cream transition duration-200 hover:-translate-y-1 hover:border-gold hover:bg-gold hover:text-ink hover:shadow-lg hover:shadow-gold/10"
              >
                {social.icon}
              </a>
            ))}
          </div>

          <p className="mt-5 text-sm leading-6 text-cream/70">
            Follow our lessons and course updates, or contact Aaron
            directly for student support.
          </p>

          <a
            href="https://wa.me/233248632153"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gold/30 px-4 py-2.5 text-sm font-semibold text-gold transition hover:bg-gold hover:text-ink"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.6 4.1 1.6 5.9L.2 24l6.5-1.7a11.8 11.8 0 0 0 5.4 1.4h.1C18.7 23.7 24 18.4 24 11.9c0-3.2-1.2-6.1-3.5-8.4ZM12.2 21.7h-.1a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.8 9.8 0 1 1 8.5 4.7Zm5.4-7.4c-.3-.1-1.8-.9-2.1-1-.3-.1-.5-.1-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-1.7-.8-2.9-1.5-4-3.4-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.6l-1-2.3c-.3-.7-.6-.6-.9-.6h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.7 5.9 5.2.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.2-.6-.4Z" />
            </svg>

            Chat on WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-gold/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Piano With Aaron. All rights reserved.</p>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
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
