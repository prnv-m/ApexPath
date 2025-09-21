import { Check, X } from "lucide-react";

function Gauge({ value }: { value: number }) {
  const angle = Math.min(100, Math.max(0, value));
  const bg = `conic-gradient(var(--tw-ring-color, hsl(var(--primary))) ${angle * 3.6}deg, hsl(var(--border)) 0)`;
  return (
    <div className="relative h-20 w-20 rounded-full" style={{ backgroundImage: bg }}>
      <div className="absolute inset-1 rounded-full bg-white dark:bg-neutral-950 grid place-items-center text-center">
        <div className="text-xl font-extrabold">{value}%</div>
        <div className="text-[10px] text-foreground/60 -mt-1">Overall</div>
      </div>
    </div>
  );
}

export default function MatchPreviewCard() {
  return (
    <div className="rounded-3xl border bg-white dark:bg-neutral-950 p-5 shadow-sm max-w-xl mx-auto">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg overflow-hidden">
          <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
            <div className="bg-[#f25022]" />
            <div className="bg-[#7fba00]" />
            <div className="bg-[#00a4ef]" />
            <div className="bg-[#ffb900]" />
          </div>
        </div>
        <div className="flex-1">
          <div className="inline-flex text-xs px-2 py-0.5 rounded-full bg-secondary">1 hour ago</div>
          <div className="mt-1 font-semibold">Senior Data Analyst</div>
          <div className="text-sm text-foreground/70">Microsoft</div>
        </div>
        <Gauge value={96} />
      </div>
      <div className="grid grid-cols-3 text-center mt-5">
        {[
          { v: 100, t: "Exp. Level" },
          { v: 92, t: "Skill" },
          { v: 96, t: "Industry Exp." },
        ].map((m, i) => (
          <div key={i} className="border-l first:border-l-0">
            <div className="text-2xl font-extrabold">{m.v}%</div>
            <div className="text-xs text-foreground/70">{m.t}</div>
          </div>
        ))}
      </div>
      <hr className="my-4 border-border" />
      <div>
        <div className="font-semibold mb-2">Why You Are A Good Fit</div>
        <div className="flex flex-wrap gap-2">
          {[
            { ok: true, label: "Experience Level" },
            { ok: true, label: "Relevant Experience" },
            { ok: false, label: "Education" },
            { ok: true, label: "Core Skills" },
          ].map((i, idx) => (
            <div
              key={idx}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                i.ok ? "bg-primary/20 text-foreground" : "bg-muted text-foreground/70"
              } animate-fade-up`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {i.ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {i.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
