import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { useState } from "react";
import type { RecommendationResponse } from "@shared/api";

// Extended type to include ATS properties
interface ExtendedRecommendationResponse extends RecommendationResponse {
  atsScore?: number;
  atsRecommendations?: string[];
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ChevronDown, ChevronUp, Clock, ExternalLink, BookOpen, Award, Briefcase, Target, FileText, Star, CheckCircle, Upload, Sparkles, TrendingUp } from "lucide-react";

const ExpandableCard = ({ item, index }: { item: any; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getIcon = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('certif') || titleLower.includes('aws') || titleLower.includes('google') || titleLower.includes('microsoft')) {
      return <Award className="w-5 h-5 text-cyan-600" />;
    }
    if (titleLower.includes('project') || titleLower.includes('build') || titleLower.includes('develop')) {
      return <Briefcase className="w-5 h-5 text-blue-600" />;
    }
    return <BookOpen className="w-5 h-5 text-teal-600" />;
  };

  const getGradient = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('certif') || titleLower.includes('aws') || titleLower.includes('google') || titleLower.includes('microsoft')) {
      return 'from-cyan-50 to-blue-50 border-cyan-200 hover:shadow-cyan-200/50';
    }
    if (titleLower.includes('project') || titleLower.includes('build') || titleLower.includes('develop')) {
      return 'from-blue-50 to-indigo-50 border-blue-200 hover:shadow-blue-200/50';
    }
    return 'from-teal-50 to-cyan-50 border-teal-200 hover:shadow-teal-200/50';
  };

  const getTypeLabel = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('certif')) return 'CERTIFICATION';
    if (titleLower.includes('project') || titleLower.includes('build')) return 'PROJECT';
    return 'COURSE';
  };

  const getTypeBadgeColor = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('certif')) return 'bg-cyan-100 text-cyan-700';
    if (titleLower.includes('project') || titleLower.includes('build')) return 'bg-blue-100 text-blue-700';
    return 'bg-teal-100 text-teal-700';
  };

  return (
    <div 
      className={`bg-gradient-to-r ${getGradient(item.title)} border-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fadeInUp opacity-0`}
      style={{ 
        animationDelay: `${index * 0.1}s`,
        animationFillMode: 'forwards'
      }}
    >
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getIcon(item.title)}
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">{item.title}</h3>
              <div className="flex items-center space-x-4 mt-1">
                {item.expected_weeks && (
                  <span className="text-sm text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {item.expected_weeks} weeks
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(item.title)}`}>
                  {getTypeLabel(item.title)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {item.resources && (
              <span className="text-xs bg-white/80 text-gray-600 px-2 py-1 rounded-full border">
                {item.resources.length} resources
              </span>
            )}
            <div className="p-1 rounded-full bg-white/80 transition-transform duration-200">
              {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
            </div>
          </div>
        </div>
      </div>
      
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-4 pb-4 pt-0 border-t border-white/50">
          {item.description && (
            <p className="text-gray-700 mb-3 leading-relaxed mt-3">{item.description}</p>
          )}
          {item.resources && item.resources.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 flex items-center">
                <ExternalLink className="w-4 h-4 mr-2" />
                Resources:
              </h4>
              <div className="space-y-1">
                {item.resources.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-teal-600 hover:text-teal-700 hover:underline transition-colors"
                  >
                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-2"></span>
                    {resource.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ATSScoreDisplay = ({ score, recommendations }: { score?: number; recommendations?: string[] }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-green-50 to-emerald-50 border-green-200';
    if (score >= 60) return 'from-yellow-50 to-amber-50 border-yellow-200';
    return 'from-red-50 to-rose-50 border-red-200';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl animate-fadeIn">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          ATS Compatibility Score
        </h3>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r ${getScoreGradient(score)}`}>
          <TrendingUp className={`w-4 h-4 ${getScoreColor(score)}`} />
          <span className={`font-bold ${getScoreColor(score)}`}>{score}/100</span>
          <span className={`text-sm font-medium ${getScoreColor(score)}`}>({getScoreLabel(score)})</span>
        </div>
      </div>
      
      {recommendations && recommendations.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-2 flex items-center">
            <Star className="w-4 h-4 mr-2" />
            Optimization Suggestions:
          </h4>
          <ul className="space-y-2">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function ResumeAI() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [optimizeResume, setOptimizeResume] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtendedRecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Convert PDF to Base64
  const fileToBase64 = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    return btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );
  };

  // Generate recommendations
  const generateRecommendations = async () => {
    if (!resumeFile) {
      toast.error("Please upload a resume PDF");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const base64Resume = await fileToBase64(resumeFile);
      
      // Replace this with your actual API endpoint
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: base64Resume,
          jobDescription,
          optimizeResume,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate recommendations");
      }

      const data: ExtendedRecommendationResponse = await response.json();
      setResult(data);
      toast.success("Recommendations generated successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-pulse-gentle {
          animation: pulse 2s infinite;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #0891b2, #0284c7, #2563eb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
      
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50/30 via-cyan-50/20 to-blue-50/30">
        <Header />
        <main className="flex-1">
          <section className="container mx-auto py-12 md:py-20 px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-4 gradient-text">Resume AI</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Transform your resume with AI-powered insights and get personalized recommendations for your career growth
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
              {/* Upload & Options Card */}
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-white to-teal-50/30 border-2 border-teal-100 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-t-lg">
                    <CardTitle className="flex items-center text-xl">
                      <Sparkles className="w-6 h-6 mr-3" />
                      Upload & Improve My Resume
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Resume File (PDF)</label>
                      <div className="relative">
                        <Input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 transition-all"
                        />
                        <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                      {resumeFile && (
                        <div className="text-sm text-green-600 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {resumeFile.name} uploaded
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Job Description</label>
                      <Textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description here for personalized recommendations..."
                        className="h-32 resize-none border-2 border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <input
                        type="checkbox"
                        id="optimize-resume"
                        checked={optimizeResume}
                        onChange={(e) => setOptimizeResume(e.target.checked)}
                        className="w-5 h-5 text-teal-600 border-2 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <label htmlFor="optimize-resume" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Optimize resume for ATS (Applicant Tracking System)
                      </label>
                    </div>
                    
                    <Button 
                      onClick={generateRecommendations} 
                      disabled={loading}
                      className={`w-full py-3 text-lg font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transform transition-all duration-300 ${
                        loading ? 'animate-pulse-gentle' : 'hover:scale-105'
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Generating AI Insights...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Target className="w-5 h-5 mr-2" />
                          Generate Recommendations
                        </div>
                      )}
                    </Button>
                    
                    {error && (
                      <div className="p-3 bg-red-50 border-l-4 border-red-400 text-red-700 rounded animate-fadeIn">
                        <p className="text-sm font-medium">{error}</p>
                      </div>
                    )}
                    
                    {/* ATS Score Display */}
                    {optimizeResume && result && (result.atsScore || result.atsRecommendations) && (
                      <ATSScoreDisplay 
                        score={result.atsScore} 
                        recommendations={result.atsRecommendations} 
                      />
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Results Section */}
              <div className="space-y-6">
                {!result && !loading && (
                  <Card className="bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-200 hover:border-teal-300 transition-colors duration-300">
                    <CardContent className="p-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-teal-600" />
                      </div>
                      <p className="text-gray-500 text-lg">
                        Your personalized skill gaps and career roadmap will appear here
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Upload your resume and job description to get started
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Skill Gaps */}
                {result && Array.isArray(result.skillGaps) && result.skillGaps.length > 0 && (
                  <Card className="bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-200 shadow-lg animate-fadeIn">
                    <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-lg">
                      <CardTitle className="text-lg flex items-center">
                        <Target className="w-5 h-5 mr-2" />
                        Detected Skill Gaps
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {result.skillGaps.map((gap, idx) => (
                          <span 
                            key={idx} 
                            className="px-3 py-1 bg-white/80 text-rose-700 rounded-full text-sm font-medium border border-rose-200 hover:shadow-sm transition-shadow animate-fadeInUp"
                            style={{ animationDelay: `${idx * 0.1}s` }}
                          >
                            {gap}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Learning Plan */}
                {result && Array.isArray(result.plan) && result.plan.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold gradient-text mb-2">Your Personalized Learning Path</h2>
                      <p className="text-gray-600">Click on each item to explore details and resources</p>
                    </div>
                    {result.plan.map((item, idx) => (
                      <ExpandableCard key={idx} item={item} index={idx} />
                    ))}
                  </div>
                )}

                {/* Raw Response Fallback */}
                {result && result.raw && (
                  <Card className="bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-200 shadow-lg animate-fadeIn">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                      <CardTitle className="text-lg flex items-center">
                        <BookOpen className="w-5 h-5 mr-2" />
                        Full Recommendation Report
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="prose prose-sm md:prose-lg max-w-none text-foreground">
                        <ReactMarkdown
                          children={String(result.raw)}
                          components={{
                            h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-6 mb-3 text-gray-800 border-b-2 border-teal-200 pb-2" {...props} />,
                            h2: ({ ...props }) => <h2 className="text-xl font-semibold mt-5 mb-3 text-gray-800 text-teal-700" {...props} />,
                            h3: ({ ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-700" {...props} />,
                            ul: ({ ...props }) => <ul className="list-none pl-0 my-3 space-y-1" {...props} />,
                            ol: ({ ...props }) => <ol className="list-decimal pl-6 my-3 space-y-1" {...props} />,
                            li: ({ ...props }) => (
                              <li className="flex items-start mb-2 text-gray-700">
                                <span className="w-2 h-2 bg-teal-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                <span>{props.children}</span>
                              </li>
                            ),
                            table: ({ ...props }) => <table className="table-auto border-collapse my-4 w-full bg-white rounded-lg overflow-hidden shadow-sm" {...props} />,
                            th: ({ ...props }) => <th className="border border-gray-200 px-4 py-3 bg-teal-50 font-semibold text-gray-800 text-left" {...props} />,
                            td: ({ ...props }) => <td className="border border-gray-200 px-4 py-3 text-gray-700" {...props} />,
                            pre: ({ ...props }) => <pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto text-sm border" {...props} />,
                            code: ({ ...props }) => <code className="bg-gray-100 rounded px-2 py-1 text-sm text-gray-800" {...props} />,
                            p: ({ ...props }) => <p className="my-3 text-gray-700 leading-relaxed" {...props} />,
                            a: ({ ...props }) => <a className="text-teal-600 hover:text-teal-700 underline font-medium transition-colors" target="_blank" rel="noreferrer" {...props} />,
                            hr: () => <hr className="my-6 border-gray-200" />,
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}