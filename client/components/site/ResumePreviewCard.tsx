import { Sparkles } from "lucide-react";

function Score({ value }: { value: number }) {
  const angle = Math.min(10, Math.max(0, value)) * 36;
  const bg = `conic-gradient(#ffb86b ${angle}deg, hsl(var(--border)) 0)`;
  return (
    <div className="relative h-24 w-24 rounded-full" style={{ backgroundImage: bg }}>
      <div className="absolute inset-1 rounded-full bg-white dark:bg-neutral-950 grid place-items-center text-center">
        <div className="text-2xl font-extrabold">{value.toFixed(1)}</div>
        <div className="text-[10px] text-foreground/60 -mt-1">EXCELLENT</div>
      </div>
    </div>
  );
}

export default function ResumePreviewCard() {
  return (
    <div className="rounded-3xl border bg-white dark:bg-neutral-950 p-5 shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary"/> Jamie Parker</div>
        <Score value={9.0} />
      </div>
      <div className="space-y-4 text-sm">
        <div>
          <div className="font-semibold">PROFESSIONAL SUMMARY</div>
          <p className="mt-1 bg-emerald-50/60 dark:bg-emerald-900/20 inline">Senior Software Engineer with over five years of experience specializing in backend development and distributed systems...</p>
        </div>
        <div>
          <div className="font-semibold">SKILL</div>
          <p className="mt-1">
            Java, Python, Go, Apache Kafka, Kubernetes, CI/CD, Prometheus, Node.js, <span className="underline text-primary">Typescript</span>, Multimedia System, HLS
          </p>
        </div>
        <div>
          <div className="font-semibold">EXPERIENCE</div>
          <ul className="list-disc pl-6">
            <li>Designed and implemented microservices architecture ... <span className="underline text-primary">video streaming services</span></li>
          </ul>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mt-6">
        {[
          "Summary Enhanced",
          "Relevant Skills Highlighted",
          "Recent Work Experience Enhanced",
        ].map((t, i) => (
          <div key={i} className="px-3 py-2 rounded-full bg-primary/20 text-sm animate-fade-up" style={{animationDelay:`${i*120}ms`}}>
            ✨ {t}
          </div>
        ))}
      </div>
    </div>
  );
}
