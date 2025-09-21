import { useEffect, useState } from "react";

interface JobItem {
  id: string;
  title: string;
  company: string;
  logo: string | null;
  publishedAt: string; // ISO
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

export default function JobTicker() {
  const [items, setItems] = useState<JobItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/jobs");
        const data = (await res.json()) as JobItem[];
        setItems(data.slice(0, 20));
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  return (
    <div className="w-full overflow-hidden">
      <div className="flex gap-8 animate-[ticker_8s_linear_infinite] will-change-transform">
        {[...items, ...items].map((job, idx) => (
          <div
            key={job.id + idx}
            className="flex items-center gap-3 rounded-2xl bg-white/70 dark:bg-white/5 shadow-sm border border-border/60 px-4 py-3 min-w-[360px]"
          >
            {job.logo ? (
              <img src={job.logo} alt={job.company} referrerPolicy="no-referrer" className="h-10 w-10 rounded-md object-cover ring-1 ring-border/70 bg-white" />
            ) : (
              <div className="h-10 w-10 rounded-md bg-secondary grid place-items-center font-semibold text-foreground/70">
                {job.company?.slice(0,1) || "?"}
              </div>
            )}
            <div className="truncate">
              <div className="text-sm font-semibold truncate">{job.company}</div>
              <div className="text-sm text-foreground/70 truncate">{job.title}</div>
            </div>
            <div className="ml-auto text-xs text-foreground/60 whitespace-nowrap">
              {timeAgo(job.publishedAt)}
            </div>
          </div>
        ))}
      </div>
      <style>
        {`@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}
      </style>
    </div>
  );
}
