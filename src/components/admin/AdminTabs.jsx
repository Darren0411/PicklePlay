const tabs = [
  { id: "bookings", label: "User Bookings" },
  { id: "manageSlots", label: "Manage Slots" },
  { id: "slots", label: "Generate Slots" },
];

export default function AdminTabs({ activeTab, setActiveTab }) {
  return (
    <div className="border border-border rounded-md bg-card p-1 flex gap-1 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 py-2 px-4 rounded-sm text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/10"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}