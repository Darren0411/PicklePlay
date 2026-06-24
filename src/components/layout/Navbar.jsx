import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function PickleballIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="2" width="8" height="13" rx="4" fill="currentColor" opacity="0.9"/>
      <rect x="11" y="13" width="4" height="6" rx="1" fill="currentColor"/>
      <rect x="9" y="19" width="8" height="2.5" rx="1" fill="currentColor"/>
      <circle cx="13" cy="8" r="1.2" fill="white" opacity="0.6"/>
    </svg>
  );
}

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
              <PickleballIcon />
            </div>
            <span className="text-xl font-semibold tracking-tight text-foreground">
              PicklePlay
            </span>
          </div>
          <Button onClick={() => navigate("/booking")}>
            Book Now →
          </Button>
        </div>
      </div>
    </nav>
  );
}