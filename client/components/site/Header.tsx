import { Link, NavLink } from "react-router-dom";

const NavItem = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-3 py-2 rounded-full text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors ${
        isActive ? "bg-accent text-accent-foreground" : "text-foreground/80"
      }`
    }
  >
    {children}
  </NavLink>
);

export default function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-background/70 border-b border-border/60">
      <div className="container mx-auto flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">A</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-teal-600">ApexPath</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1" />
        <div className="flex items-center gap-2">
          <NavLink to="/signin" className="text-sm font-medium px-3 py-2 rounded-full hover:bg-accent">
            SIGN IN
          </NavLink>
          <NavLink
            to="/join"
            className="text-sm font-semibold px-4 py-2 rounded-full bg-foreground text-background hover:opacity-90"
          >
            JOIN NOW
          </NavLink>
        </div>
      </div>
    </header>
  );
}
