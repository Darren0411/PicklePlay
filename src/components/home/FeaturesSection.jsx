import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: "⬡",
    title: "Premium Facility",
    description:
      "Climate-controlled indoor court with professional-grade surface and lighting. Perfect conditions, every single time.",
  },
  {
    icon: "↯",
    title: "Instant Booking",
    description:
      "Real-time slot availability at your fingertips. No phone calls needed. Book in 30 seconds, play in minutes.",
  },
  {
    icon: "◈",
    title: "Flexible Payment",
    description:
      "Pay online via UPI for instant confirmation, or choose to pay at the court. Your choice, your convenience.",
  },
];

export default function FeaturesSection() {
  return (
    <div className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-3">
            Why Players Choose Us
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            The perfect blend of convenience, quality, and professional service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border border-border bg-card">
              <CardContent className="p-8">
                <div className="w-10 h-10 rounded-md border border-border flex items-center justify-center mb-5 text-primary text-lg">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}