import Image from "next/image";
import Link from "next/link";

function StudentsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TeachingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m2 10 10-5 10 5-10 5-10-5ZM6 12.5V17l6 3 6-3v-4.5M22 10v6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MusicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 18V5l11-2v13M9 9l11-2M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm11-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PianoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 5h16v14H4V5Zm4 0v14m4-14v14m4-14v14M4 13h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatCard({ className, icon, value, label }) {
  return (
    <div
      className={`absolute z-30 rounded-2xl border border-gold/40 bg-black/90 px-4 py-4 text-cream shadow-2xl backdrop-blur-md ${className}`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
          {icon}
        </span>

        <div>
          <p className="text-xl font-bold leading-none text-white">
            {value}
          </p>

          <p className="mt-1 max-w-24 text-xs leading-4 text-cream/65">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-gold/20 bg-ink text-cream">
      {/* Global faint grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(212,175,55,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.4) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      {/* Left-side glow */}
      <div
        className="absolute left-[8%] top-1/3 h-96 w-96 rounded-full bg-gold/10 blur-[140px]"
        aria-hidden="true"
      />

      {/* Piano background behind the words */}
      <div
        className="absolute bottom-0 right-0 top-0 hidden w-[59%] overflow-hidden lg:block"
        aria-hidden="true"
      >
        <Image
          src="/images/piano-hero.jpg"
          alt=""
          fill
          priority
          sizes="60vw"
          className="object-cover object-left opacity-[0.22]"
        />

        {/* Darkens image so the text remains readable */}
        <div className="absolute inset-0 bg-black/38" />

        {/* Fade image into the portrait side */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/35 to-black/5" />

        {/* Fade top and bottom edges */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/35 via-transparent to-ink/45" />

        {/* Subtle gold tint */}
        <div className="absolute inset-0 bg-gold/[0.035] mix-blend-screen" />
      </div>

      {/* Mobile piano background */}
      <div
        className="absolute inset-0 lg:hidden"
        aria-hidden="true"
      >
        <Image
          src="/images/piano-hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-[0.09]"
        />

        <div className="absolute inset-0 bg-ink/88" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-transparent to-ink" />
      </div>

      <div className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-16 px-4 py-20 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8">
        {/* Portrait section */}
        <div className="relative order-2 mx-auto w-full max-w-[500px] lg:order-1">
          <div
            className="absolute inset-12 rounded-full bg-gold/20 blur-[90px]"
            aria-hidden="true"
          />

          <div
            className="absolute -left-10 top-2 hidden grid-cols-5 gap-3 lg:grid"
            aria-hidden="true"
          >
            {Array.from({ length: 25 }).map((_, index) => (
              <span
                key={index}
                className="h-1 w-1 rounded-full bg-gold/55"
              />
            ))}
          </div>

          <div className="relative mx-auto w-[84%] overflow-hidden rounded-[2rem] border border-gold/60 bg-deep shadow-2xl shadow-black/60 sm:w-[78%] lg:w-[82%]">
            <div className="relative aspect-[4/5]">
              <Image
                src="/images/aaron-piano-about.jpeg"
                alt="Aaron playing gospel piano"
                fill
                priority
                sizes="(max-width: 1024px) 80vw, 36vw"
                className="object-cover object-center"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/5" />
            </div>
          </div>

          <StatCard
            className="-left-2 top-[25%] sm:-left-8"
            icon={<StudentsIcon />}
            value="300+"
            label="Students taught"
          />

          <StatCard
            className="-right-2 top-[27%] sm:-right-8"
            icon={<TeachingIcon />}
            value="2016"
            label="Teaching since"
          />

          <StatCard
            className="-bottom-7 left-1/2 -translate-x-1/2"
            icon={<MusicIcon />}
            value="2007"
            label="Piano journey"
          />
        </div>

        {/* Text section */}
        <div className="relative z-20 order-1 lg:order-2">
          <div className="inline-flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold backdrop-blur-sm">
              <PianoIcon />
            </span>

            <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold sm:text-base">
              Gospel Piano Lessons
            </p>

            <span
              className="hidden h-px w-16 bg-gold/60 sm:block"
              aria-hidden="true"
            />
          </div>

          <h1 className="mt-7 max-w-3xl font-display text-5xl font-bold leading-[1.04] text-white sm:text-6xl lg:text-[4.7rem]">
            Master Gospel Piano{" "}
            <span className="text-gold">
              with Confidence
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-cream/75 sm:text-lg">
            Learn chords, progressions and how to play by ear
            through structured lessons created for beginners,
            intermediate and advanced pianists.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-gold px-8 py-4 font-bold text-ink shadow-lg shadow-gold/10 transition duration-300 hover:-translate-y-1 hover:brightness-105"
            >
              Start Learning
              <span aria-hidden="true">→</span>
            </Link>

            <a
              href="https://www.youtube.com/@PIANOTUTORIALS-GH"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-xl border border-gold/45 bg-black/40 px-8 py-4 font-semibold text-cream backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-gold hover:text-gold"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-xs text-ink"
                aria-hidden="true"
              >
                ▶
              </span>

              Watch on YouTube
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <div className="flex -space-x-3">
              {["A", "B", "D", "E"].map((initial) => (
                <span
                  key={initial}
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-deep text-sm font-bold text-gold"
                >
                  {initial}
                </span>
              ))}
            </div>

            <div>
              <div
                className="flex gap-1 text-lg text-gold"
                aria-label="Five star student rating"
              >
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>

              <p className="mt-1 text-sm text-cream/65">
                Trusted by 300+ students
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
