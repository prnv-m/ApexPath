export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container mx-auto py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-foreground/60">© {new Date().getFullYear()} ApexPath</p>
        <div className="text-sm text-foreground/60 flex gap-6">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}
