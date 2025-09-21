import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto py-24">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">{title}</h1>
          <p className="text-foreground/70 max-w-2xl">
            This page is a placeholder. Continue prompting to fill in this page.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
