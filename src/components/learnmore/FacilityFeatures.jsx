import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Indoor Court",
    description:
      "Play comfortably indoors, protected from weather. Our single court is well-maintained and ready for action year-round.",
  },
  {
    title: "Professional Lighting",
    description:
      "Bright, even lighting throughout the court ensures perfect visibility for every shot, whether morning or evening.",
  },
  {
    title: "Free Equipment",
    description:
      "We provide quality paddles and balls at no extra cost. Feel free to bring your own equipment if you prefer.",
  },
  {
    title: "Affordable Rates",
    description:
      "Just ₹200 per hour — one of the most affordable rates in the city. Quality play shouldn't cost a fortune.",
  },
  {
    title: "Easy Online Booking",
    description:
      "Book your slot in seconds through our website. See real-time availability and get instant confirmation.",
  },
  {
    title: "Friendly Community",
    description:
      "Join a welcoming community of players. Whether you're a beginner or pro, everyone's welcome here.",
  },
];

export default function FacilityFeatures() {
  return (
    <div className="py-16 bg-card border-y border-border">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            What We Offer
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {features.map((feature) => (
            <Card key={feature.title} className="border border-border bg-background">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-foreground mb-2">
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