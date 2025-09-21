import type { RequestHandler } from "express";

export interface JobItem {
  id: string;
  title: string;
  company: string;
  logo: string | null;
  publishedAt: string; // ISO
}

export const handleJobs: RequestHandler = async (_req, res) => {
  try {
    const resp = await fetch("https://remotive.com/api/remote-jobs");
    const json = (await resp.json()) as any;
    const items: JobItem[] = (json?.jobs || []).map((j: any) => ({
      id: String(j.id),
      title: j.title,
      company: j.company_name,
      logo: j.company_logo_url || null,
      publishedAt: j.publication_date,
    }));
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};
