const inclusions = [
  "Full hour of court time",
  "Free paddles (or BYOP)",
  "Free pickleballs",
  "Professional lighting",
  "Indoor climate protection",
  "On-site support",
];

export default function PricingSection() {
  return (
    <div className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
            Simple, Affordable Pricing
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            No complicated tiers. Just one great rate for everyone.
          </p>

          <div className="border border-border rounded-md bg-card p-8 mb-4 text-center">
            <div className="text-5xl font-semibold tracking-tight text-foreground mb-1">
              ₹200
            </div>
            <div className="text-sm text-muted-foreground mb-2">per hour</div>
            <div className="text-xs text-muted-foreground">
              Available from 6:00 AM to 10:00 PM daily
            </div>
          </div>

          <div className="border border-border rounded-md bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              What's Included in Every Booking
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {inclusions.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="var(--primary)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Pro tip: Book multiple consecutive slots for extended play sessions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}