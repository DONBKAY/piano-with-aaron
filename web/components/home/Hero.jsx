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
      className={`absolute z-20 rounded-2xl border border-gold/35 bg-black/90 px-4 py-4 text-cream shadow-2xl backdrop-blur-md ${className}`}
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
      <div
        className="absolute inset-0 opacity-[0.055]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(212,175,55,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.4) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div
        className="absolute left-0 top-1/3 h-80 w-80 rounded-full bg-gold/10 blur-[130px]"
        aria-hidden="true"
      />

      <div
        className="absolute bottom-0 right-0 top-0 hidden w-[58%] lg:block"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-gold/[0.07] via-gold/[0.025] to-transparent" />

        <div
          className="absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 30%, rgba(212,175,55,0.8) 0 1px, transparent 2px), radial-gradient(circle at 30% 70%, rgba(212,175,55,0.5) 0 1px, transparent 2px)",
            backgroundSize: "46px 46px, 64px 64px",
          }}
        />

        <svg
          viewBox="0 0 900 700"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full opacity-[0.14]"
        >
          <path
            d="M-50 470 C140 350 220 610 430 440 C610 290 730 390 960 210"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gold"
          />

          <path
            d="M-40 500 C170 380 250 640 450 470 C640 310 770 420 970 250"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            className="text-gold"
          />

          <path
            d="M80 190 C270 60 400 250 570 155 C700 80 810 110 940 35"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            className="text-gold"
          />

          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-gold"
            opacity="0.6"
          >
            <path d="M540 410v135" />
            <path d="M575 394v151" />
            <path d="M610 375v170" />
            <path d="M645 355v190" />
            <path d="M680 335v210" />
            <path d="M715 315v230" />
            <path d="M750 295v250" />
            <path d="M785 275v270" />
            <path d="M820 255v290" />
          </g>
        </svg>

        <div className="absolute inset-0 bg-gradient-to-r from-ink via-transparent to-black/20" />
      </div>

      <div className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-16 px-4 py-20 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8">
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

          <div className="relative mx-auto w-[84%] overflow-hidden rounded-[2rem] border border-gold/55 bg-deep shadow-2xl shadow-black/60 sm:w-[78%] lg:w-[82%]">
            <div className="relative aspect-[4/5]">
              <Image
                src="/images/aaron-piano-about.jpeg"
                alt="Aaron playing gospel piano"
                fill
                priority
                sizes="(max-width: 1024px) 80vw, 36vw"
                className="object-cover object-center"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />
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

        <div className="relative z-10 order-1 lg:order-2">
          <div className="inline-flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
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

          <h1 className="mt-7 max-w-3xl font-display text-5xl font-bold leading-[1.04] sm:text-6xl lg:text-[4.7rem]">
            Master Gospel Piano{" "}
            <span className="text-gold">
              with Confidence
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-cream/70 sm:text-lg">
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
              className="inline-flex items-center justify-center gap-3 rounded-xl border border-gold/45 bg-black/20 px-8 py-4 font-semibold text-cream transition duration-300 hover:-translate-y-1 hover:border-gold hover:text-gold"
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

              <p className="mt-1 text-sm text-cream/60">
                Trusted by 300+ students
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
