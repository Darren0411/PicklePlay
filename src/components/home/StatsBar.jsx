const stats = [
  { value: "100+", label: "Happy Players" },
  { value: "500+", label: "Bookings Completed" },
  { value: "4.9★", label: "Average Rating" },
];

export default function StatsBar() {
  return (
    <div className="border-y border-border bg-card">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl font-semibold tracking-tight text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}