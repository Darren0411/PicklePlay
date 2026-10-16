import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function formatDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

function getSlotConfig(status) {
  switch (status) {
    case "booked":
      return { badge: "destructive", label: "Booked", actionLabel: "Booked", disabled: true };
    case "unavailable":
      return { badge: "secondary", label: "Unavailable", actionLabel: "Make Available", disabled: false };
    case "past":
      return { badge: "secondary", label: "Past", actionLabel: "Past", disabled: true };
    default:
      return { badge: "outline", label: "Available", actionLabel: "Make Unavailable", disabled: false };
  }
}

const noteItems = [
  { label: "Available", desc: "Customers can book this slot." },
  { label: "Unavailable", desc: "Slot is hidden from the booking page." },
  { label: "Booked", desc: "Cannot be modified — already booked by a customer." },
  { label: "Past", desc: "Slot time has already passed." },
];

export default function ManageSlots({
  selectedSlotDate,
  setSelectedSlotDate,
  slotsForDate,
  loadingSlotsForDate,
  updatingSlot,
  onToggleSlot,
}) {
  return (
    <div className="space-y-4">
      <div className="border border-border rounded-md bg-card p-6">
        <h2 className="text-sm font-semibold tracking-tight text-foreground mb-1">
          Manage Slot Availability
        </h2>
        <p className="text-xs text-muted-foreground mb-5">
          Mark slots as available or unavailable for bookings.
        </p>

        <div className="mb-5">
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Select Date
          </label>
          <input
            type="date"
            value={formatDateString(selectedSlotDate)}
            onChange={(e) => {
              const [year, month, day] = e.target.value.split("-");
              const newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              newDate.setHours(0, 0, 0, 0);
              setSelectedSlotDate(newDate);
            }}
            className="text-sm border border-border rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Viewing:{" "}
            <span className="font-medium text-foreground">
              {formatDateDisplay(formatDateString(selectedSlotDate))}
            </span>
          </p>
        </div>

        {loadingSlotsForDate ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : slotsForDate.length === 0 ? (
          <div className="border border-border rounded-md p-8 text-center">
            <p className="text-sm font-medium text-foreground mb-1">No slots found</p>
            <p className="text-xs text-muted-foreground">
              Generate slots first or select a different date.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {slotsForDate.map((slot) => {
              const config = getSlotConfig(slot.status);
              return (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-4 border border-border rounded-md bg-background"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {slot.time || slot.displayTime || `${slot.startTime} - ${slot.endTime}`}
                      </span>
                      <Badge variant={config.badge} className="text-xs py-0">
                        {config.label}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">₹{slot.price}</span>
                  </div>
                  <Button
                    variant={slot.status === "unavailable" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onToggleSlot(slot.id, slot.status)}
                    disabled={config.disabled || updatingSlot === slot.id}
                    className="text-xs"
                  >
                    {updatingSlot === slot.id ? "Updating..." : config.actionLabel}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border border-border rounded-md bg-card p-5">
        <h3 className="text-xs font-medium text-foreground uppercase tracking-wide mb-3">
          Status Reference
        </h3>
        <div className="space-y-2">
          {noteItems.map((item) => (
            <div key={item.label} className="flex items-start gap-2">
              <span className="text-xs font-medium text-foreground min-w-[80px]">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}