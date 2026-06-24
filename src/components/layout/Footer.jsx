import { useNavigate } from "react-router-dom";

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

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
              <PickleballIcon />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              PicklePlay
            </span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} PicklePlay Court Booking
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Built with Love by Darren 
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}