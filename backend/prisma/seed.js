const { PrismaClient } = require("@prisma/client");
const { slugify } = require("../src/utils/slugify");

const prisma = new PrismaClient();

const COURSES = [
  {
    title: "Piano Basics",
    category: "Beginners Corner",
    subcategory: "Piano Basics",
    description:
      "Learn proper hand position, note names, and your first simple melodies — no experience required.",
    price: 150,
    currency: "GHS",
    sections: [
      {
        title: "Getting Started",
        lessons: [
          { title: "Meet the Keyboard", videoUrl: "https://vimeo.com/000000001", isPreview: true, durationSec: 420 },
          { title: "Hand Position & Posture", videoUrl: "https://vimeo.com/000000002", durationSec: 380 },
        ],
      },
      {
        title: "Your First Melody",
        lessons: [
          { title: "Playing Twinkle Twinkle", videoUrl: "https://vimeo.com/000000003", durationSec: 500 },
        ],
      },
    ],
  },
  {
    title: "Reading Music 101",
    category: "Beginners Corner",
    subcategory: "Reading Music 101",
    description: "Understand the staff, note values, and rhythm so you can read any sheet music with confidence.",
    price: 150,
    currency: "GHS",
    sections: [
      {
        title: "The Staff & Notes",
        lessons: [
          { title: "Treble and Bass Clef", videoUrl: "https://vimeo.com/000000004", isPreview: true, durationSec: 400 },
          { title: "Note Values & Rhythm", videoUrl: "https://vimeo.com/000000005", durationSec: 450 },
        ],
      },
    ],
  },
  {
    title: "Chord Inversions",
    category: "Intermediate Pathway",
    subcategory: "Chord Inversions",
    description: "Master root position, first, and second inversions to make your playing sound smoother and more professional.",
    price: 250,
    currency: "GHS",
    sections: [
      {
        title: "Understanding Inversions",
        lessons: [
          { title: "What Is an Inversion?", videoUrl: "https://vimeo.com/000000006", isPreview: true, durationSec: 360 },
          { title: "First Inversion Triads", videoUrl: "https://vimeo.com/000000007", durationSec: 420 },
        ],
      },
    ],
  },
  {
    title: "Scales & Arpeggios",
    category: "Intermediate Pathway",
    subcategory: "Scales & Arpeggios",
    description: "Build finger independence and technique with major, minor, and arpeggio patterns across the keyboard.",
    price: 250,
    currency: "GHS",
    sections: [
      {
        title: "Major Scales",
        lessons: [
          { title: "C Major Scale, Both Hands", videoUrl: "https://vimeo.com/000000008", isPreview: true, durationSec: 480 },
        ],
      },
    ],
  },
  {
    title: "Jazz Improvisation",
    category: "Advanced Techniques",
    subcategory: "Jazz Improvisation",
    description: "Learn to improvise confidently over jazz standards using scales, chord tones, and voice leading.",
    price: 400,
    currency: "GHS",
    sections: [
      {
        title: "Foundations of Improv",
        lessons: [
          { title: "The ii-V-I Progression", videoUrl: "https://vimeo.com/000000009", isPreview: true, durationSec: 520 },
        ],
      },
    ],
  },
  {
    title: "Advanced Rhythms",
    category: "Advanced Techniques",
    subcategory: "Advanced Rhythms",
    description: "Tackle syncopation, polyrhythms, and odd time signatures to expand your rhythmic vocabulary.",
    price: 400,
    currency: "GHS",
    sections: [
      {
        title: "Syncopation",
        lessons: [
          { title: "Off-Beat Accents", videoUrl: "https://vimeo.com/000000010", isPreview: true, durationSec: 400 },
        ],
      },
    ],
  },
  {
    title: "Pop Hits",
    category: "Learning Songs",
    subcategory: "Pop Hits",
    description: "Play along to today's biggest pop songs with simplified arrangements for every skill level.",
    price: 200,
    currency: "GHS",
    sections: [
      {
        title: "Chart-Topping Favorites",
        lessons: [
          { title: "Song Walkthrough #1", videoUrl: "https://vimeo.com/000000011", isPreview: true, durationSec: 600 },
        ],
      },
    ],
  },
  {
    title: "Classical Pieces",
    category: "Learning Songs",
    subcategory: "Classical Pieces",
    description: "Work through beloved classical pieces broken into manageable, well-paced lessons.",
    price: 200,
    currency: "GHS",
    sections: [
      {
        title: "Beginner Classical Repertoire",
        lessons: [
          { title: "Für Elise, Opening Theme", videoUrl: "https://vimeo.com/000000012", isPreview: true, durationSec: 550 },
        ],
      },
    ],
  },
];

async function main() {
  for (const c of COURSES) {
    const slug = slugify(c.title);

    const course = await prisma.course.upsert({
      where: { slug },
      update: {},
      create: {
        title: c.title,
        slug,
        description: c.description,
        price: c.price,
        currency: c.currency,
        category: c.category,
        subcategory: c.subcategory,
        published: true,
      },
    });

    // Clear existing curriculum so re-running the seed doesn't duplicate lessons
    await prisma.section.deleteMany({ where: { courseId: course.id } });

    for (let sIdx = 0; sIdx < c.sections.length; sIdx++) {
      const s = c.sections[sIdx];
      const section = await prisma.section.create({
        data: { courseId: course.id, title: s.title, order: sIdx },
      });

      for (let lIdx = 0; lIdx < s.lessons.length; lIdx++) {
        const l = s.lessons[lIdx];
        await prisma.lesson.create({
          data: {
            sectionId: section.id,
            title: l.title,
            videoUrl: l.videoUrl,
            isPreview: Boolean(l.isPreview),
            durationSec: l.durationSec,
            order: lIdx,
          },
        });
      }
    }

    console.log(`Seeded: ${course.title}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
