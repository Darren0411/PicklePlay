import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function SlotSkeleton() {
  return (
    <div className="w-full flex items-center justify-between p-4 rounded-md border border-border">
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-12" />
    </div>
  );
}

function getSlotConfig(slot, isSelected) {
  switch (slot.status) {
    case "booked":
      return {
        container: "border-border bg-card opacity-50 cursor-not-allowed",
        badge: "destructive",
        label: "Booked",
      };
    case "past":
      return {
        container: "border-border bg-card opacity-40 cursor-not-allowed",
        badge: "secondary",
        label: "Past",
      };
    case "unavailable":
      return {
        container: "border-border bg-card opacity-40 cursor-not-allowed",
        badge: "secondary",
        label: "Unavailable",
      };
    default:
      return {
        container: isSelected
          ? "border-primary bg-primary/5 cursor-pointer"
          : "border-border bg-card hover:border-primary/50 cursor-pointer",
        badge: "outline",
        label: "Available",
      };
  }
}

export default function SlotList({ timeSlots, selectedSlots, toggleSlotSelection, loading }) {
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-3 space-y-2">
        {[...Array(6)].map((_, i) => <SlotSkeleton key={i} />)}
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="border border-border rounded-md p-8 text-center">
          <div className="w-10 h-10 rounded-md border border-border flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">No Slots Available</h3>
          <p className="text-xs text-muted-foreground">
            Slots for this date haven't been created yet. Please try another date.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-3">
      <div className="space-y-2">
        {timeSlots.map((slot) => {
          const isSelected = selectedSlots.find((s) => s.id === slot.id);
          const config = getSlotConfig(slot, isSelected);

          return (
            <button
              key={slot.id}
              onClick={() => toggleSlotSelection(slot)}
              disabled={!slot.available || slot.isPast || slot.status !== "available"}
              className={`w-full flex items-center justify-between p-4 rounded-md border transition-colors ${config.container}`}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {slot.displayTime}
                  </span>
                  <Badge variant={config.badge} className="text-xs py-0">
                    {config.label}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">1 hour slot</span>
              </div>

              <div className="flex items-center gap-3">
                {slot.status === "available" && !slot.isPast ? (
                  <>
                    <span className="text-sm font-semibold text-foreground">
                      ₹{slot.price}
                    </span>
                    <div className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-colors ${
                      isSelected ? "bg-primary border-primary" : "border-border"
                    }`}>
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}