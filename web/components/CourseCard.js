export default function CourseCard({ course }) {
  const priceLabel =
    course.currency === "USD" ? `$${course.price}` : `GHS ${course.price}`;

  return (
    <a
      href={`/courses/${course.slug}`}
      className="group block rounded-2xl border border-gold/20 bg-white/50 dark:bg-deep/50 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition"
    >
      <div className="h-40 bg-gradient-to-br from-gold/30 to-deep/40 flex items-center justify-center">
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <span className="font-display text-2xl opacity-40">🎹</span>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs uppercase tracking-wide text-gold font-semibold mb-1">
          {course.subcategory}
        </p>
        <h3 className="font-display text-xl mb-2 group-hover:text-gold transition">
          {course.title}
        </h3>
        <p className="text-sm opacity-70 line-clamp-2 mb-4">{course.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-semibold">{priceLabel}</span>
          {course._count && (
            <span className="text-xs opacity-60">{course._count.sections} sections</span>
          )}
        </div>
      </div>
    </a>
  );
}
