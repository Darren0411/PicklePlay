export default function LearnMoreHero() {
  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-6 pt-32 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-md border border-border bg-background mb-6">
            <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
              About Us
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4">
            About PicklePlay
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Your affordable indoor pickleball court with professional facilities.
            Quality play shouldn't break the bank.
          </p>
        </div>
      </div>
    </div>
  );
}