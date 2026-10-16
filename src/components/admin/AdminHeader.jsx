import { Button } from "@/components/ui/button";
import BrandMark from "@/components/layout/BrandMark";

export default function AdminHeader({ onSignOut }) {
  return (
    <div className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandMark size={50} className="block" />
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-foreground">
                PicklePlay Admin
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage bookings, slots & revenue
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-sm bg-primary" />
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
            <Button variant="outline" size="sm" onClick={onSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}