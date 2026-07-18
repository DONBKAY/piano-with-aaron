import Image from "next/image";
import Link from "next/link";

const achievements = [
  {
    value: "300+",
    label: "Students Taught",
    description: "Helping aspiring pianists learn with confidence",
    icon: "students",
  },
  {
    value: "Since 2016",
    label: "Teaching Piano",
    description: "Years of practical teaching experience",
    icon: "calendar",
  },
  {
    value: "Since 2007",
    label: "Playing Piano",
    description: "A lifelong journey of learning and musicianship",
    icon: "piano",
  },
  {
    value: "Gospel",
    label: "Piano Focus",
    description: "Chords, progressions, accompaniment and playing by ear",
    icon: "music",
  },
];

const learningPoints = [
  "Identify and understand piano chords",
  "Form major, minor and other useful chords",
  "Play common gospel chord progressions",
  "Develop your ability to play by ear",
  "Accompany singers and worship teams",
  "Play confidently without depending on memorization",
];

const teachingValues = [
  {
    title: "Simple Explanations",
    text: "Lessons are broken into clear steps so that difficult musical ideas become easier to understand.",
  },
  {
    title: "Practical Learning",
    text: "You will apply each concept directly on the piano instead of learning theory without practice.",
  },
  {
    title: "Independent Playing",
    text: "The goal is to help you identify chords, understand progressions and play confidently by yourself.",
  },
];

function Icon({ type }) {
  if (type === "students") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-7 w-7"
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

  if (type === "calendar") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path
          d="M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "piano") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path
          d="M3 5h18v14H3V5Zm4 0v9m5-9v9m5-9v9M7 14h3v5H7v-5Zm5 0h3v5h-3v-5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-7 w-7"
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

export const metadata = {
  title: "About Aaron | Piano With Aaron",
  description:
    "Meet Aaron, a gospel piano instructor helping students understand chords, play by ear and become confident independent pianists.",
};

export default function AboutPage() {
  return (
    <div className="overflow-hidden bg-ink text-cream">
      <section className="relative border-b border-gold/20">
        <div
          className="absolute inset-0 opacity-[0.08]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-20">
          <div className="relative mx-auto w-full max-w-xl lg:mx-0">
            <div className="absolute -inset-4 rounded-[2rem] bg-gold/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-gold/30 bg-deep shadow-2xl">
              <div className="relative aspect-[4/5]">
                <Image
                  src="/images/aaron-piano-about.jpg"
                  alt="Aaron playing the piano"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover object-center"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
                    Gospel Piano Instructor
                  </p>

                  <p className="mt-2 font-display text-2xl font-bold text-white">
                    Aaron
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-2 rounded-2xl border border-gold/30 bg-deep/95 px-5 py-4 shadow-xl backdrop-blur sm:right-[-24px]">
              <p className="text-2xl font-bold text-gold">300+</p>
              <p className="text-sm text-cream/70">Students taught</p>
            </div>
          </div>

          <div className="max-w-3xl">
            <p className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.25em] text-gold">
              <span className="h-px w-10 bg-gold" />
              Meet Your Instructor
            </p>

            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
              Hi, I&apos;m{" "}
              <span className="text-gold">Aaron</span>
            </h1>

            <p className="mt-4 text-lg font-medium text-cream/75 sm:text-xl">
              Gospel Piano Instructor • Educator • Mentor
            </p>

            <div className="mt-8 space-y-5 text-base leading-8 text-cream/75 sm:text-lg">
              <p>
                I began learning the piano in{" "}
                <strong className="text-cream">2007</strong>, driven by
                a passion for music and a desire to understand how
                chords, melodies and progressions work together.
              </p>

              <p>
                In <strong className="text-gold">2016</strong>, I began
                teaching after realizing that many people wanted to
                learn piano but needed a simpler and more practical
                way to understand it.
              </p>

              <p>
                Through Piano With Aaron, I help students learn gospel
                piano, identify chords and develop the confidence to
                play independently.
              </p>
            </div>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 font-bold text-ink transition hover:-translate-y-0.5 hover:brightness-105"
              >
                Explore Courses
                <span aria-hidden="true">→</span>
              </Link>

              <a
                href="https://www.youtube.com/@PIANOTUTORIALS-GH"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-xl border border-cream/25 px-6 py-3.5 font-semibold text-cream transition hover:border-gold hover:text-gold"
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-cream text-xs text-ink"
                  aria-hidden="true"
                >
                  ▶
                </span>
                Watch Me Teach
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gold/20 bg-black/20">
        <div className="mx-auto grid max-w-7xl gap-px bg-gold/20 sm:grid-cols-2 lg:grid-cols-4">
          {achievements.map((achievement) => (
            <article
              key={achievement.label}
              className="bg-ink px-6 py-8 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/35 bg-gold/10 text-gold">
                <Icon type={achievement.icon} />
              </div>

              <p className="mt-5 font-display text-3xl font-bold text-gold">
                {achievement.value}
              </p>

              <h2 className="mt-2 font-semibold">
                {achievement.label}
              </h2>

              <p className="mt-2 text-sm leading-6 text-cream/55">
                {achievement.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {teachingValues.map((value, index) => (
            <article
              key={value.title}
              className="rounded-2xl border border-gold/20 bg-deep/60 p-7 transition hover:-translate-y-1 hover:border-gold/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold font-bold text-ink">
                {String(index + 1).padStart(2, "0")}
              </div>

              <h2 className="mt-6 font-display text-2xl font-bold">
                {value.title}
              </h2>

              <p className="mt-4 leading-7 text-cream/65">
                {value.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-gold/20 bg-deep/40">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">
              My Story
            </p>

            <h2 className="mt-4 font-display text-4xl font-bold">
              Making piano easier to understand
            </h2>

            <div className="mt-7 space-y-5 leading-8 text-cream/70">
              <p>
                My journey with the piano began in 2007. As I continued
                learning and developing as a musician, I discovered
                that many aspiring pianists struggled because lessons
                often felt complicated and difficult to apply.
              </p>

              <p>
                That experience inspired me to begin teaching in 2016.
                I wanted to help people learn more easily through clear
                explanations, practical demonstrations and structured
                practice.
              </p>

              <p>
                Piano With Aaron was created to give students a learning
                path that moves from basic understanding to confident,
                independent playing.
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">
              My Mission
            </p>

            <h2 className="mt-4 font-display text-4xl font-bold">
              Helping you play by yourself
            </h2>

            <p className="mt-7 leading-8 text-cream/70">
              My greatest goal is to help every student understand
              chords, recognize progressions and become confident
              enough to play without always depending on someone else.
            </p>

            <blockquote className="mt-8 rounded-2xl border-l-4 border-gold bg-gold/10 p-6">
              <p className="font-display text-xl leading-8 text-cream">
                “I want every student to understand what they are
                playing, identify chords and confidently play the piano
                independently.”
              </p>

              <footer className="mt-4 text-sm font-semibold text-gold">
                — Aaron
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">
            What You Will Learn
          </p>

          <h2 className="mt-4 font-display text-4xl font-bold">
            Build practical gospel piano skills
          </h2>

          <p className="mt-6 max-w-xl leading-8 text-cream/65">
            Each course is designed to take you beyond memorizing
            songs. You will learn musical principles that can be
            applied to different keys, songs and playing situations.
          </p>

          <Link
            href="/courses"
            className="mt-8 inline-flex items-center gap-2 font-bold text-gold hover:underline"
          >
            View available courses
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {learningPoints.map((point) => (
            <div
              key={point}
              className="flex items-start gap-4 rounded-xl border border-gold/15 bg-deep/50 p-5"
            >
              <span
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-ink"
                aria-hidden="true"
              >
                ✓
              </span>

              <p className="leading-7 text-cream/75">{point}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-gold/35 bg-gradient-to-r from-gold/15 via-deep to-gold/10 px-6 py-12 text-center sm:px-10 lg:px-16">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">
            Begin Today
          </p>

          <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
            Ready to start your piano journey?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-cream/70">
            Join Piano With Aaron and begin developing the knowledge,
            confidence and practical skills you need to play gospel
            piano independently.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/courses"
              className="rounded-xl bg-gold px-7 py-3.5 font-bold text-ink transition hover:brightness-105"
            >
              Start Learning
            </Link>

            <a
              href="https://wa.me/233248632153"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-cream/25 px-7 py-3.5 font-semibold transition hover:border-gold hover:text-gold"
            >
              Contact Aaron
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
