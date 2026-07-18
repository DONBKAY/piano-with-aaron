export default function CourseCard({ course }) {
  const numericPrice = Number(course.price) || 0;

  const priceLabel =
    course.currency === "USD"
      ? `$${numericPrice.toLocaleString()}`
      : `GHS ${numericPrice.toLocaleString()}`;

  const averageRating = Number(course.averageRating) || 0;
  const reviewCount = Number(course.reviewCount) || 0;

  const reviewLabel =
    reviewCount === 1
      ? "1 review"
      : `${reviewCount.toLocaleString()} reviews`;

  return (
    <a
      href={`/courses/${course.slug}`}
      className="group block overflow-hidden rounded-2xl border border-gold/20 bg-white/50 transition hover:-translate-y-1 hover:shadow-xl dark:bg-deep/50"
    >
      <div className="flex h-40 items-center justify-center bg-gradient-to-br from-gold/30 to-deep/40">
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-display text-2xl opacity-40">🎹</span>
        )}
      </div>

      <div className="p-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gold">
          {course.subcategory || course.category || "Piano Course"}
        </p>

        <h3 className="mb-2 font-display text-xl transition group-hover:text-gold">
          {course.title}
        </h3>

        <p className="mb-4 line-clamp-2 text-sm opacity-70">
          {course.description}
        </p>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div
            className="flex items-center"
            aria-label={`${averageRating} out of 5 stars`}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-base ${
                  star <= Math.round(averageRating)
                    ? "text-gold"
                    : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>

          {reviewCount > 0 ? (
            <>
              <span className="text-sm font-semibold">
                {averageRating.toFixed(1)}
              </span>

              <span className="text-xs opacity-60">
                ({reviewLabel})
              </span>
            </>
          ) : (
            <span className="text-xs opacity-60">
              No reviews yet
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="font-semibold">{priceLabel}</span>

          {course._count && (
            <span className="text-xs opacity-60">
              {course._count.sections}{" "}
              {course._count.sections === 1 ? "section" : "sections"}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
