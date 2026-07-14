export default function AdminDashboard() {
  const stats = [
    {
      title: "Students",
      value: "0",
      icon: "👨‍🎓",
    },
    {
      title: "Courses",
      value: "0",
      icon: "📚",
    },
    {
      title: "Revenue",
      value: "GH₵0",
      icon: "💰",
    },
    {
      title: "Enrollments",
      value: "0",
      icon: "🎓",
    },
  ];

  const actions = [
    {
      title: "New Course",
      href: "/admin/new",
      icon: "➕",
    },
    {
      title: "Manage Courses",
      href: "/admin/courses",
      icon: "📚",
    },
    {
      title: "Students",
      href: "/admin/students",
      icon: "👨‍🎓",
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: "📈",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}

      <div>
        <h1 className="text-4xl font-bold">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Welcome back! Manage your Piano With Aaron LMS from one place.
        </p>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {stats.map((stat) => (

          <div
            key={stat.title}
            className="bg-white rounded-xl shadow-sm border p-6"
          >

            <div className="text-3xl">
              {stat.icon}
            </div>

            <p className="text-gray-500 mt-4">
              {stat.title}
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {stat.value}
            </h2>

          </div>

        ))}

      </div>

      {/* Quick Actions */}

      <div>

        <h2 className="text-2xl font-semibold mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          {actions.map((action) => (

            <a
              key={action.title}
              href={action.href}
              className="rounded-xl border bg-white p-6 hover:shadow-md transition"
            >

              <div className="text-3xl">
                {action.icon}
              </div>

              <h3 className="font-semibold mt-4">
                {action.title}
              </h3>

            </a>

          ))}

        </div>

      </div>

      {/* Recent Activity */}

      <div className="rounded-xl border bg-white p-6">

        <h2 className="text-2xl font-semibold mb-4">
          Recent Activity
        </h2>

        <p className="text-gray-500">
          No recent activity yet.
        </p>

      </div>

    </div>
  );
}
