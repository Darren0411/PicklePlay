import { Button } from "@/components/ui/button";

export default function GenerateSlots({
  loading,
  progress,
  result,
  selectedDays,
  setSelectedDays,
  lastSlotDate,
  loadingLastDate,
  onGenerate,
  onReset,
}) {
  const nextDayAfterLast = lastSlotDate
    ? new Date(lastSlotDate.getTime() + 86400000).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : null;

  return (
    <div className="space-y-4">
      {/* Current status */}
      <div className="border border-border rounded-md bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Current Slots Status</h2>
        {loadingLastDate ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-muted-foreground">Checking existing slots...</span>
          </div>
        ) : lastSlotDate ? (
          <div className="border border-border rounded-md p-4">
            <p className="text-xs text-muted-foreground mb-1">Slots available until</p>
            <p className="text-base font-semibold text-foreground mb-2">
              {lastSlotDate.toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric", year: "numeric",
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              Next generation starts from{" "}
              <span className="font-medium text-foreground">{nextDayAfterLast}</span>
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-md p-4">
            <p className="text-sm font-medium text-foreground mb-1">No existing slots</p>
            <p className="text-xs text-muted-foreground">
              Generation will start from today.
            </p>
          </div>
        )}
      </div>

      {/* Generator */}
      <div className="border border-border rounded-md bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-1">Generate Booking Slots</h2>
        <p className="text-xs text-muted-foreground mb-5">
          Create slots for the next 30–60 days.
        </p>

        <div className="mb-5">
          <label className="block text-xs font-medium text-foreground mb-2">
            Select Duration
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[30, 45, 60].map((days) => (
              <button
                key={days}
                onClick={() => setSelectedDays(days)}
                className={`p-4 rounded-md border transition-colors text-center ${
                  selectedDays === days
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:border-primary/50"
                }`}
              >
                <div className="text-xl font-semibold">{days}</div>
                <div className="text-xs opacity-70 mt-0.5">days</div>
              </button>
            ))}
          </div>
        </div>

        <div className="border border-border rounded-md p-4 mb-5">
          <p className="text-xs font-medium text-foreground mb-2">What will happen</p>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>• Start from <span className="font-medium text-foreground">{lastSlotDate ? nextDayAfterLast : "today"}</span></li>
            <li>• Generate slots for <span className="font-medium text-foreground">next {selectedDays} days</span></li>
            <li>• Each day gets <span className="font-medium text-foreground">13 time slots</span> (8:00 AM – 9:00 PM)</li>
            <li>• All slots priced at <span className="font-medium text-foreground">₹200 per hour</span></li>
            <li>• Existing slots will not be duplicated</li>
          </ul>
        </div>

        {!result && (
          <Button
            onClick={onGenerate}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Generating Slots..." : `Generate ${selectedDays} Days of Slots`}
          </Button>
        )}

        {progress && (
          <div className="mt-3 flex items-center gap-2 border border-border rounded-md p-3">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="text-xs text-muted-foreground">{progress}</span>
          </div>
        )}

        {result?.success && (
          <div className="mt-3 border border-border rounded-md p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Slots Generated Successfully
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="border border-border rounded-md p-3 text-center">
                <div className="text-2xl font-semibold text-foreground">{result.totalDays}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Days Processed</div>
              </div>
              <div className="border border-border rounded-md p-3 text-center">
                <div className="text-2xl font-semibold text-foreground">{result.newSlots}</div>
                <div className="text-xs text-muted-foreground mt-0.5">New Slots Created</div>
              </div>
            </div>
            {result.skipped > 0 && (
              <p className="text-xs text-muted-foreground mb-3">
                {result.skipped} slots already existed and were skipped.
              </p>
            )}
            <div className="border border-border rounded-md p-3 mb-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{result.startDate}</span>
                {" → "}
                <span className="font-medium text-foreground">{result.endDate}</span>
              </p>
            </div>
            <Button variant="outline" onClick={onReset} className="w-full">
              Generate More Slots
            </Button>
          </div>
        )}

        {result && !result.success && (
          <div className="mt-3 border border-destructive/30 rounded-md p-4">
            <p className="text-sm font-medium text-destructive mb-1">Error Generating Slots</p>
            <p className="text-xs text-muted-foreground mb-3">{result.error}</p>
            <Button variant="outline" size="sm" onClick={onReset}>Try Again</Button>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="border border-border rounded-md bg-card p-5">
        <h3 className="text-xs font-medium text-foreground uppercase tracking-wide mb-3">
          How It Works
        </h3>
        <div className="space-y-2 text-xs text-muted-foreground">
          {[
            ["Smart Detection", "System automatically finds your last available slot date."],
            ["Continuous Generation", "New slots start from the day after your last slot."],
            ["No Gaps", "Ensures uninterrupted availability for customers."],
            ["Safe Operation", "Existing slots are never duplicated or overwritten."],
          ].map(([title, desc]) => (
            <div key={title} className="flex gap-2">
              <span className="font-medium text-foreground min-w-[130px]">{title}</span>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}