import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTAButton({ to, children, variant = "dark" }: { to: string; children: React.ReactNode; variant?: "dark" | "primary" | "light" }) {
  const base = "group inline-flex items-center gap-3 rounded-full px-6 py-3 font-semibold shadow transition-transform active:scale-95";
  const styles =
    variant === "primary"
      ? "bg-primary text-primary-foreground"
      : variant === "light"
      ? "bg-white text-foreground border"
      : "bg-foreground text-background";
  return (
    <Link to={to} className={`${base} ${styles}`}>
      <span>{children}</span>
      <span className="ml-1 grid place-items-center h-7 w-7 rounded-full bg-white text-black">
        <ChevronRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
