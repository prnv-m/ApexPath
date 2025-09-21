import type { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // or directly 'your_api_key_here'
});

// ----------------- Load Combined Catalog -----------------
function loadCatalog(fileName: string) {
  const raw = fs.readFileSync(path.join(__dirname, "catalogs", fileName), "utf-8");
  const parsed = JSON.parse(raw);

  if (Array.isArray(parsed)) return parsed;

  console.warn(`Warning: ${fileName} does not contain an array. Returning empty array.`);
  return [];
}

const catalog = loadCatalog("coursecertskills.json");

// ----------------- Build Knowledge Base Docs -----------------
const kbDocs = catalog.map((c: any) => ({
  type: c.type || "resource", // "course" or "certification"
  text: `${c.title}: ${c.description}`,
  meta: c,
}));

// ----------------- Upload Resume -----------------
export interface UploadResumeBody {
  fileName: string;
  mimeType: string;
  contentBase64?: string; // optional: if sent server-side
}

export const handleUploadResume: RequestHandler = async (req, res) => {
  const body = req.body as UploadResumeBody;
  if (!body?.fileName) return res.status(400).json({ error: "Invalid payload" });

  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  res.json({ id, fileName: body.fileName, mimeType: body.mimeType });
};

// ----------------- Simple Recommendations -----------------
export interface RecommendationBody {
  resumeText?: string;
  jobDescription?: string;
  skillGaps?: string[];
}

export const handleRecommendations: RequestHandler = async (req, res) => {
  const { resumeText = "", jobDescription = "", skillGaps = [] } =
    req.body as RecommendationBody;

  const userPrompt = `
You are a career coach. Given a resume and a job description, identify missing ESCO skills and propose a step-by-step plan:

- Courses & Certifications
- 2-3 portfolio project ideas
- Soft skills

Respond strictly in JSON:
{
  "skillGaps": [],
  "plan": [
    { "title": "", "description": "", "resources": [{ "name":"", "url":"" }], "expected_weeks": 0 }
  ]
}

Resume:
${resumeText}

Job Description:
${jobDescription}

Known gaps: ${skillGaps.join(", ")}
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: userPrompt }],
      model: "openai/gpt-oss-120b",
      temperature: 0.2,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: false,
    });

    const content = chatCompletion.choices[0]?.message?.content ?? "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { raw: content };
    }

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get recommendations from Grok" });
  }
};

// ----------------- Upload + RAG Recommendations -----------------
export interface UploadAndRecommendBody {
  fileName: string;
  resumeText: string;
  jobDescription: string;
  optimizeResume?: boolean;
}

export const handleUploadAndRecommend: RequestHandler = async (req, res) => {
  const body = req.body as UploadAndRecommendBody;
  if (!body?.resumeText || !body?.fileName || !body?.jobDescription) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { resumeText, jobDescription, optimizeResume = false } = body;

  // ----------------- Simple RAG Filtering -----------------
  const combinedText = `${resumeText} ${jobDescription}`.toLowerCase();
  const relevantDocs = kbDocs
    .filter((doc) =>
      doc.text.toLowerCase().split(/\s+/).some((word) => combinedText.includes(word))
    )
    .slice(0, 10);

  // ----------------- Grok Prompt -----------------
  const prompt = `
You are a professional career coach using ESCO skills.

1. Compare the candidate's resume with the job description.
2. Identify missing ESCO skills.
3. Recommend courses & certifications (from provided catalog), 2-3 portfolio projects, and soft skills.
4. If "optimizeResume" is true, provide resume optimization suggestions to pass ATS.

Use ONLY the following catalog entries:
${JSON.stringify(relevantDocs.map((d) => d.text))}

Resume:
${resumeText}

Job Description:
${jobDescription}

Optimize Resume: ${optimizeResume}
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-120b",
      temperature: 0.2,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: false,
    });

    const content = chatCompletion.choices[0]?.message?.content ?? "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { raw: content };
    }

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get RAG-based recommendations from Grok" });
  }
};