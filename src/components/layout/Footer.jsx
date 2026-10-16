import { useNavigate } from "react-router-dom";
import BrandMark from "@/components/layout/BrandMark";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <BrandMark size={42} className="block" />
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