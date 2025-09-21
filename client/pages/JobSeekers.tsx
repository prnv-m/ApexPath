import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Sparkles, HelpCircle, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

interface MatchedJob {
  jobId: number;
  title: string;
  companyName: string;
  description: string;
  similarityScore: number;
}

interface ResumeAiPayload {
  jobDescription: string;
  resume: {
    type: 'text' | 'file';
    content: string;
    fileName?: string;
    mimeType?: string;
  };
}

export default function JobSeekers() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("Ready to start");
  const [resumeText, setResumeText] = useState("");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([]);
  const [originalResumePayload, setOriginalResumePayload] = useState<ResumeAiPayload['resume'] | null>(null);

  const [isExplanationLoading, setIsExplanationLoading] = useState(false);
  const [explanationKeywords, setExplanationKeywords] = useState<string[]>([]);
  const [selectedJobForExplanation, setSelectedJobForExplanation] = useState<MatchedJob | null>(null);

  const onFile = (f: File | null) => {
    setFile(f);
    setMatchedJobs([]);
  };

  const startMatching = async (payload: { file?: File | null; text?: string }) => {
    setIsLoading(true);
    setMatchedJobs([]);
    setProgress(10);
    setStatus("Preparing request...");

    let requestBody = {};
    let resumePayloadForRedirect: ResumeAiPayload['resume'] | null = null;

    try {
      if (payload.text) {
        requestBody = { resume_text: payload.text };
        resumePayloadForRedirect = { type: 'text', content: payload.text };
      } else if (payload.file) {
        setStatus("Encoding file...");
        const base64String = await fileToBase64(payload.file);
        requestBody = {
          file_base64: base64String,
          mime_type: payload.file.type,
        };
        resumePayloadForRedirect = {
          type: 'file',
          content: base64String,
          fileName: payload.file.name,
          mimeType: payload.file.type,
        };
      } else {
        throw new Error("No resume data provided.");
      }
      
      setOriginalResumePayload(resumePayloadForRedirect);

      setProgress(40);
      setStatus("Sending to server for analysis...");

      const res = await fetch("http://localhost:5001/match-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to get job matches from the server.");
      }

      setProgress(100);
      setMatchedJobs(data);
      setStatus(`Matching complete! Found ${data.length} jobs.`);
      toast.success("Successfully matched jobs!");
    } catch (e: any) {
      toast.error(e.message || "An unknown error occurred.");
      setStatus(`Error: ${e.message}`);
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAnalyzeWithAI = (job: MatchedJob) => {
    if (!originalResumePayload) {
      toast.error("Could not find the original resume data. Please try matching again.");
      return;
    }
    const payload: ResumeAiPayload = {
      jobDescription: job.description,
      resume: originalResumePayload
    };
    localStorage.setItem('resumeAiRedirectPayload', JSON.stringify(payload));
    window.location.href = 'http://localhost:8081/resume-ai';
  };

  // UPDATED: The "Explain Match" handler is now much simpler and more robust
  const handleExplainMatch = async (job: MatchedJob) => {
    if (!originalResumePayload) {
      toast.error("Original resume data not found.");
      return;
    }

    setIsExplanationLoading(true);
    setExplanationKeywords([]);
    setSelectedJobForExplanation(job);

    try {
      // Build the request body based on the original payload, whatever it was
      let requestBody: any = {
        job_description_text: job.description,
      };

      if (originalResumePayload.type === 'text') {
        requestBody.resume_text = originalResumePayload.content;
      } else {
        requestBody.file_base64 = originalResumePayload.content;
        requestBody.mime_type = originalResumePayload.mimeType;
      }
      
      const res = await fetch("http://localhost:5001/explain-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get explanation.");

      setExplanationKeywords(data.matchingKeywords);

    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsExplanationLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 border-b">
          <div className="container mx-auto py-16 md:py-24 grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">AI Job Match</h1>
              <p className="mt-4 text-foreground/70 max-w-xl">
                Apply only to Jobs you are qualified for. Discover matched jobs based on your skills.
              </p>
            </div>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Upload Resume</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="file">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file">Upload File</TabsTrigger>
                    <TabsTrigger value="paste">Paste Text</TabsTrigger>
                  </TabsList>
                  <TabsContent value="file" className="space-y-3">
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const f = e.dataTransfer.files?.[0];
                        if (f) onFile(f);
                      }}
                      className="aspect-[3/2] rounded-xl border-2 border-dashed border-border grid place-items-center text-center p-6"
                    >
                      {file ? (
                        <div className="space-y-2">
                          <div className="font-semibold">{file.name}</div>
                          <Button onClick={() => startMatching({ file })} disabled={isLoading}>
                            {isLoading ? "Matching..." : "Start Matching"}
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold">Drag & Drop</p>
                          <p className="text-sm text-foreground/60">a .txt or .pdf file</p>
                          <Input
                            type="file"
                            onChange={(e) => onFile(e.target.files?.[0] || null)}
                            className="mt-3"
                            accept=".txt,.pdf"
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="paste" className="space-y-3">
                    <Textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste resume text" className="h-40" />
                    <Button onClick={() => startMatching({ text: resumeText })} disabled={!resumeText || isLoading}>
                      {isLoading ? "Matching..." : "Start Matching"}
                    </Button>
                  </TabsContent>
                </Tabs>
                {isLoading && <Progress value={progress} className="h-2" />}
                <div className="text-sm text-foreground/70">{status}</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {matchedJobs.length > 0 && (
          <section className="container mx-auto py-16">
            <h2 className="text-3xl font-bold tracking-tight text-center">Top 5 Job Matches</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {matchedJobs.map((job) => (
                <Dialog key={job.jobId}>
                  <Card className="flex flex-col hover:shadow-lg transition-shadow">
                    <DialogTrigger asChild>
                      <div className="cursor-pointer">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{job.title}</CardTitle>
                            <Badge variant="secondary">
                              {Math.round(job.similarityScore * 100)}% Match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{job.companyName}</p>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <p className="text-sm text-foreground/80">
                            {job.description.substring(0, 200)}...
                            <span className="text-cyan-600 font-semibold ml-1">View more</span>
                          </p>
                        </CardContent>
                      </div>
                    </DialogTrigger>
                    <CardFooter className="mt-auto pt-4 border-t grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => handleExplainMatch(job)}
                      >
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Explain Match
                      </Button>
                      <Button 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white" 
                        onClick={() => handleAnalyzeWithAI(job)}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Analyze w/ AI
                      </Button>
                    </CardFooter>
                  </Card>
                  <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">{job.title}</DialogTitle>
                      <DialogDescription className="flex items-center space-x-4 pt-1">
                        <span>{job.companyName}</span>
                        <Badge variant="outline">{Math.round(job.similarityScore * 100)}% Match</Badge>
                      </DialogDescription>
                    </DialogHeader>
                    <div 
                      className="prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br />') }} 
                    />
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />

      <Dialog open={!!selectedJobForExplanation} onOpenChange={() => setSelectedJobForExplanation(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Why You're a Good Fit For</DialogTitle>
            <DialogDescription>{selectedJobForExplanation?.title}</DialogDescription>
          </DialogHeader>
          <div>
            {isExplanationLoading ? (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Matching keywords found in your resume and the job description:</h3>
                {explanationKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {explanationKeywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-base">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No significant keyword matches found. Your skills and experience may still be a good fit.</p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
