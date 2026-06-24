import { Badge } from "@/components/ui/badge";

const legendItems = [
  { label: "Available", variant: "outline" },
  { label: "Booked", variant: "destructive" },
  { label: "Unavailable", variant: "secondary" },
  { label: "Past", variant: "secondary" },
];

export default function SlotLegend() {
  return (
    <div className="container mx-auto px-4 py-3 mt-2">
      <div className="border border-border rounded-md p-4">
        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Slot Status
        </p>
        <div className="flex flex-wrap gap-2">
          {legendItems.map((item) => (
            <Badge key={item.label} variant={item.variant} className="text-xs">
              {item.label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}