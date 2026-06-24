export default function StatsGrid({ stats }) {
  const cards = [
    { label: "Total Bookings", value: stats.totalBookings, tag: "Total" },
    { label: "Total Revenue", value: `₹${stats.totalRevenue}`, tag: "Paid" },
    { label: "Pending Payments", value: `₹${stats.pendingPayments}`, tag: "Pending" },
    { label: "Today's Bookings", value: stats.todayBookings, tag: "Today" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="border border-border rounded-md bg-card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {card.label}
            </span>
            <span className="text-xs font-medium text-muted-foreground border border-border rounded-sm px-2 py-0.5">
              {card.tag}
            </span>
          </div>
          <div className="text-3xl font-semibold tracking-tight text-foreground">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}