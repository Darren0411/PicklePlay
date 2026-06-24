import { Button } from "@/components/ui/button";

function PickleballIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="2" width="8" height="13" rx="4" fill="currentColor" opacity="0.9"/>
      <rect x="11" y="13" width="4" height="6" rx="1" fill="currentColor"/>
      <rect x="9" y="19" width="8" height="2.5" rx="1" fill="currentColor"/>
      <circle cx="13" cy="8" r="1.2" fill="white" opacity="0.6"/>
    </svg>
  );
}

export default function AdminHeader({ onSignOut }) {
  return (
    <div className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
              <PickleballIcon />
            </div>
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