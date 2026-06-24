import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    title: "Pick Your Time",
    description:
      "Browse available slots in real-time. Choose any hour between 6 AM – 10 PM.",
  },
  {
    number: "02",
    title: "Choose Payment",
    description:
      "Pay online instantly via UPI/Card or select the pay-at-venue option.",
  },
  {
    number: "03",
    title: "Show Up & Play",
    description:
      "Get instant confirmation. Arrive 5 minutes early and we'll have everything ready.",
  },
];

export default function HowToBook() {
  const navigate = useNavigate();

  return (
    <div className="py-16 bg-card border-y border-border">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
            How to Book
          </h2>
          <p className="text-sm text-muted-foreground mb-10">
            Get on the court in 3 simple steps.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {steps.map((step) => (
              <div
                key={step.number}
                className="border border-border rounded-md bg-background p-6"
              >
                <div className="text-xs font-mono text-muted-foreground mb-3">
                  {step.number}
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" onClick={() => navigate("/booking")}>
              Book Your Court Now →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}