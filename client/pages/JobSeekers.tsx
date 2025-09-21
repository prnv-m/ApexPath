import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function JobSeekers() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [resumeText, setResumeText] = useState("");
  const [progress, setProgress] = useState(0);

  const onFile = (f: File | null) => {
    setFile(f);
    setUploadId(null);
  };

  const upload = async (payload: {file?: File|null, text?: string}) => {
    try {
      setStatus("Uploading...");
      setProgress(40);
      let fileName = "resume.txt";
      let mimeType = "text/plain";
      let contentBase64 = "";
      if (payload.file) {
        fileName = payload.file.name;
        mimeType = payload.file.type || "application/pdf";
        contentBase64 = await payload.file.arrayBuffer().then((b) => btoa(String.fromCharCode(...new Uint8Array(b))));
      } else if (payload.text) {
        contentBase64 = btoa(unescape(encodeURIComponent(payload.text)));
      }
      const res = await fetch("/api/upload-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, mimeType, contentBase64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setProgress(100);
      setUploadId(data.id);
      setStatus("Uploaded");
      toast.success("Resume uploaded successfully");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
      setStatus("Failed");
      setProgress(0);
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
                    <TabsTrigger value="file">File</TabsTrigger>
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
                          <Button onClick={() => upload({file})}>Start Matching</Button>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold">Drag & Drop</p>
                          <p className="text-sm text-foreground/60">or choose a file</p>
                          <Input type="file" onChange={(e) => onFile(e.target.files?.[0] || null)} className="mt-3" />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="paste" className="space-y-3">
                    <Textarea value={resumeText} onChange={(e)=>setResumeText(e.target.value)} placeholder="Paste resume text" className="h-40" />
                    <Button onClick={()=>upload({text: resumeText})} disabled={!resumeText}>Start Matching</Button>
                  </TabsContent>
                </Tabs>
                <Progress value={progress} className="h-2" />
                <div className="text-sm text-foreground/70">{status}</div>
                {uploadId && (
                  <div className="text-sm">
                    Uploaded. Your matrix-based matching can run server-side using this upload ID.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
