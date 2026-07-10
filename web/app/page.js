"use client";

import { useEffect, useState } from "react";
import { courseApi } from "../lib/api";
import CourseCard from "../components/CourseCard";



export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    courseApi
      .list()
      .then((data) => setFeatured(data.courses.slice(0, 3)))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <main>
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/piano-hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-ink/70" />
        <div className="relative z-10">
          <p className="text-sm uppercase tracking-widest text-gold font-semibold mb-4">
            Piano with Aaron
          </p>
          <h1 className="font-display text-5xl md:text-6xl max-w-3xl mb-6 text-cream">
            Start Playing Piano Today
          </h1>
          <p className="opacity-80 max-w-xl mb-8 text-cream mx-auto">
            Structured, premium video courses that take you from your first note
            to playing the songs you love.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/courses" className="px-6 py-3 rounded-lg bg-gold text-ink font-semibold">
              Browse courses
            </a>
            <a href="/signup" className="px-6 py-3 rounded-lg border border-cream/40 text-cream">
              Sign up free
            </a>
          </div>
        </div>
      </section>
      

      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="font-display text-3xl mb-8 text-center">Featured Courses</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-3xl mb-8">What students are saying</h2>
        <blockquote className="opacity-70 italic max-w-xl mx-auto">
          "I went from not being able to read a note to playing my favorite
          song in six weeks. The lessons are clear and easy to follow."
        </blockquote>
      </section>
    </main>
  );
}
