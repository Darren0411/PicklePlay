import { Button } from "@/components/ui/button";

export default function BookingBottomBar({ selectedSlots, totalPrice, onProceed, loading }) {
  if (selectedSlots.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              {selectedSlots.length} slot{selectedSlots.length > 1 ? "s" : ""} selected
            </p>
            <p className="text-lg font-semibold tracking-tight text-foreground">
              ₹{totalPrice.toLocaleString()}
              <span className="text-xs text-muted-foreground font-normal ml-1">+ taxes</span>
            </p>
          </div>
          <Button
            onClick={onProceed}
            disabled={loading}
            className="px-6"
          >
            {loading ? "Processing..." : "Proceed →"}
          </Button>
        </div>
      </div>
    </div>
  );
}