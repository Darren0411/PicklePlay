import { useNavigate } from "react-router-dom";

export default function BookingHeader() {
  const navigate = useNavigate();

  return (
    <div className="bg-background border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
          >
            ←
          </button>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            PicklePlay Court
          </span>
        </div>
      </div>
    </div>
  );
}