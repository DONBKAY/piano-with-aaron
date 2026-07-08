"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { courseApi } from "../../lib/api";
import CourseCard from "../../components/CourseCard";

const CATEGORIES = {
  "Beginners Corner": ["Piano Basics", "Reading Music 101"],
  "Intermediate Pathway": ["Chord Inversions", "Scales & Arpeggios"],
  "Advanced Techniques": ["Jazz Improvisation", "Advanced Rhythms"],
  "Learning Songs": ["Pop Hits", "Classical Pieces"],
};

export default function CourseCatalogPage() {
  return (
    <Suspense fallback={<main className="max-w-6xl mx-auto px-4 py-12">Loading...</main>}>
      <CourseCatalogInner />
    </Suspense>
  );
}

function CourseCatalogInner() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [subcategory, setSubcategory] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (subcategory) params.subcategory = subcategory;

    courseApi
      .list(params)
      .then((data) => setCourses(data.courses))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [search, category, subcategory]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl mb-2">Course Catalog</h1>
      <p className="opacity-70 mb-8">Find the right course for wherever you are in your piano journey.</p>

      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <input
          placeholder="Search courses..."
          className="flex-1 rounded-lg border border-gold/30 bg-transparent px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-lg border border-gold/30 bg-transparent px-4 py-2.5"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setSubcategory("");
          }}
        >
          <option value="">All categories</option>
          {Object.keys(CATEGORIES).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {category && (
          <select
            className="rounded-lg border border-gold/30 bg-transparent px-4 py-2.5"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
          >
            <option value="">All subcategories</option>
            {CATEGORIES[category].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <p className="opacity-60">Loading courses...</p>
      ) : courses.length === 0 ? (
        <p className="opacity-60">No courses match your filters yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </main>
  );
}
