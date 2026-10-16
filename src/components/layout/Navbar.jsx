import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BrandMark from "@/components/layout/BrandMark";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
           <BrandMark size={50} className="block" />
            <span className="text-xl font-semibold tracking-tight text-foreground">
              PicklePlay
            </span>
          </div>
          <Button onClick={() => navigate("/booking")}>Book Now →</Button>
        </div>
      </div>
    </nav>
  );
}