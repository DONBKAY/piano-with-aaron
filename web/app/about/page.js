import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About Aaron | Piano With Aaron",
  description:
    "Meet Aaron, a gospel piano instructor helping students understand chords, play by ear and play confidently.",
};

const statistics = [
  {
    number: "300+",
    title: "Students Taught",
    text: "Helping students learn piano with confidence.",
  },
  {
    number: "2016",
    title: "Teaching Since",
    text: "Years of practical piano teaching experience.",
  },
  {
    number: "2007",
    title: "Piano Journey",
    text: "Learning, playing and growing as a musician.",
  },
  {
    number: "Gospel",
    title: "Piano Focus",
    text: "Chords, progressions and playing by ear.",
  },
];

const learningPoints = [
  "Identify major and minor chords",
  "Understand chord formation",
  "Play gospel chord progressions",
  "Develop your ability to play by ear",
  "Accompany singers and worship teams",
  "Play confidently without depending on memorization",
];

const teachingPrinciples = [
  {
    number: "01",
    title: "Simple Explanations",
    text: "Musical concepts are broken into clear and manageable steps so that learning does not feel overwhelming.",
  },
  {
    number: "02",
    title: "Practical Lessons",
    text: "Every concept is demonstrated directly on the piano so you can immediately apply what you learn.",
  },
  {
    number: "03",
    title: "Independent Playing",
    text: "The goal is to help you understand chords and progressions well enough to play confidently by yourself.",
  },
];

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

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:min-h-[760px] lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-20">
          <div className="relative mx-auto w-full max-w-xl lg:mx-0">
            <div className="absolute -inset-5 rounded-[2rem] bg-gold/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-gold/30 bg-deep shadow-2xl">
              <div className="relative aspect-[4/5]">
                <Image
                  src="/images/aaron-piano-about.jpeg"
                  alt="Aaron playing the piano"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover object-center"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                    Gospel Piano Instructor
                  </p>

                  <p className="mt-2 font-display text-3xl font-bold text-white">
                    Aaron
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 right-2 rounded-2xl border border-gold/30 bg-deep/95 px-6 py-4 shadow-xl backdrop-blur sm:-right-6">
              <p className="font-display text-3xl font-bold text-gold">
                300+
              </p>

              <p className="text-sm text-cream/65">
                Students taught
              </p>
            </div>
          </div>

          <div className="max-w-3xl">
            <p className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.25em] text-gold">
              <span className="h-px w-10 bg-gold" />
              Meet Your Instructor
            </p>

            <h1 className="mt-6 font-display text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
              Hi, I&apos;m <span className="text-gold">Aaron</span>
            </h1>

            <p className="mt-4 text-lg font-medium text-cream/70 sm:text-xl">
              Gospel Piano Instructor • Educator • Mentor
            </p>

            <div className="mt-8 space-y-5 text-base leading-8 text-cream/70 sm:text-lg">
              <p>
                I began learning the piano in{" "}
                <strong className="text-cream">2007</strong>, driven by
                a passion for music and a desire to understand chords,
                melodies and progressions.
              </p>

              <p>
                In <strong className="text-gold">2016</strong>, I began
                teaching after realizing that many people wanted to
                learn piano but needed a simpler and more practical way
                to understand it.
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-7 py-4 font-bold text-ink transition hover:-translate-y-0.5 hover:brightness-105"
              >
                Explore Courses
                <span aria-hidden="true">→</span>
              </Link>

              <a
                href="https://www.youtube.com/@PIANOTUTORIALS-GH"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-xl border border-cream/25 px-7 py-4 font-semibold transition hover:border-gold hover:text-gold"
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
          {statistics.map((item) => (
            <article
              key={item.title}
              className="bg-ink px-6 py-9 text-center"
            >
              <p className="font-display text-4xl font-bold text-gold">
                {item.number}
              </p>

              <h2 className="mt-3 font-semibold">{item.title}</h2>

              <p className="mt-2 text-sm leading-6 text-cream/55">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {teachingPrinciples.map((principle) => (
            <article
              key={principle.title}
              className="rounded-2xl border border-gold/20 bg-deep/60 p-7 transition hover:-translate-y-1 hover:border-gold/45"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold font-bold text-ink">
                {principle.number}
              </div>

              <h2 className="mt-6 font-display text-2xl font-bold">
                {principle.title}
              </h2>

              <p className="mt-4 leading-7 text-cream/65">
                {principle.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-gold/20 bg-deep/40">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">
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
                Piano With Aaron was created to give students a clear
                learning path that moves from basic understanding to
                confident and independent playing.
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">
              My Mission
            </p>

            <h2 className="mt-4 font-display text-4xl font-bold">
              Helping students play independently
            </h2>

            <p className="mt-7 leading-8 text-cream/70">
              My greatest goal is to help every student understand
              chords, recognize progressions and become confident
              enough to play without always depending on someone else.
            </p>

            <blockquote className="mt-8 rounded-2xl border-l-4 border-gold bg-gold/10 p-6">
              <p className="font-display text-xl leading-8">
                “I want every student to identify chords, understand
                what they are playing and confidently play the piano
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
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">
            What You Will Learn
          </p>

          <h2 className="mt-4 font-display text-4xl font-bold">
            Build practical gospel piano skills
          </h2>

          <p className="mt-6 max-w-xl leading-8 text-cream/65">
            The lessons take you beyond memorizing songs. You will
            learn musical principles that can be applied in different
            keys, songs and playing situations.
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
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">
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
              className="rounded-xl bg-gold px-8 py-4 font-bold text-ink transition hover:brightness-105"
            >
              Start Learning
            </Link>

            <a
              href="https://wa.me/233248632153"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-cream/25 px-8 py-4 font-semibold transition hover:border-gold hover:text-gold"
            >
              Contact Aaron
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
