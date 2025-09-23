import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import JobTicker from "@/components/site/JobTicker";
import CTAButton from "@/components/site/CTAButton";
import MatchPreviewCard from "@/components/site/MatchPreviewCard";
import ResumePreviewCard from "@/components/site/ResumePreviewCard";
import { Check, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Index() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("any");

  const handleSearch = () => {
    const params = new URLSearchParams();
    let searchQuery = query;
    if (experience === 'senior') {
      searchQuery = query ? `senior ${query}` : 'senior';
    }
    
    if (searchQuery) params.append("query", searchQuery);
    if (location) params.append("location", location);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-100 via-teal-50 to-transparent dark:from-cyan-900/30 dark:via-teal-900/10" />
          <div className="container mx-auto relative py-16 md:py-24 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-white/5 border text-sm mb-6">
              <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">New</span>
              <span>Introducing ApexPath Agent</span>
              <span className="hidden md:inline">the first AI that hunts jobs for you</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight animate-fade-up" style={{animationDelay:'100ms'}}>No More Solo Job Hunting</h1>
            <p className="text-5xl md:text-8xl font-extrabold tracking-tight text-foreground/80 mt-3 bg-gradient-to-r from-cyan-700 via-teal-600 to-cyan-700 bg-clip-text text-transparent animate-shimmer">DO IT WITH AI COPILOT</p>
            <p className="mt-6 text-foreground/70 max-w-2xl mx-auto animate-fade-up" style={{animationDelay:'250ms'}}>
              Our AI makes landing job interviews dramatically easier and faster – get matched jobs,
              tailored resume, and recommended insider connections in less than 1 min!
            </p>
            <div className="mt-8 flex items-center justify-center gap-4 animate-fade-up" style={{animationDelay:'350ms'}}>
              <CTAButton to="/job-seekers">Start Matching</CTAButton>
              <CTAButton to="/resume-ai" variant="primary">Improve My Resume</CTAButton>
            </div>
          </div>
        </section>

        {/* Ticker + Stats */}
        <section className="container mx-auto">
          <div className="rounded-3xl border bg-white/70 dark:bg-white/5 p-6 md:p-8 -mt-6 md:-mt-10 shadow-sm">
            <div className="grid md:grid-cols-3 text-center gap-6">
              <div>
                <div className="text-3xl md:text-4xl font-extrabold">400,000+</div>
                <div className="text-sm text-foreground/70">Today's new jobs</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-extrabold">8,000,000+</div>
                <div className="text-sm text-foreground/70">Total jobs</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-extrabold">96%</div>
                <div className="text-sm text-foreground/70">Overall fit score example</div>
              </div>
            </div>
            <div className="mt-6">
              <JobTicker />
            </div>
          </div>
        </section>

        {/* AI Features */}
        <section className="container mx-auto py-20 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">AI FEATURES</h2>
            <h3 className="text-xl md:text-2xl font-extrabold mt-4">AI Job Match</h3>
            <p className="text-foreground/70 mt-2">Job searching is already hard! Increase your odds with AI matched Jobs</p>
            <ul className="mt-4 space-y-2 text-foreground/80 text-sm">
              {[
                "Apply only to Jobs you are qualified for",
                "Discover matched jobs based on your skills, not only titles",
                "Say goodbye to fake jobs",
                "Apply early with our custom job alerts",
              ].map((t,i)=> (
                <li key={i} className="flex items-center gap-2 animate-fade-up" style={{animationDelay:`${i*80}ms`}}>
                  <span className="grid place-items-center h-6 w-6 rounded-full bg-primary text-primary-foreground"><Check className="h-4 w-4"/></span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-6"><CTAButton to="/job-seekers">Start Matching</CTAButton></div>
          </div>
          <div className="bg-transparent">
            <MatchPreviewCard />
          </div>
        </section>

        {/* Resume AI */}
        <section className="container mx-auto pb-20 grid md:grid-cols-2 gap-10 items-start">
          <div className="order-2 md:order-1">
            <h3 className="text-xl md:text-2xl font-extrabold">Resume AI</h3>
            <p className="text-foreground/70 mt-2">Stand out from the crowd with a top notch resume</p>
            <ul className="mt-4 space-y-2 text-foreground/80 text-sm">
              {[
                "Get a professional quality resume in minutes, not hours",
                "Keep tailoring your resume with AI and catch HR's eyes",
                "Rest easy knowing your resume will be ATS compatible",
              ].map((t,i)=> (
                <li key={i} className="flex items-center gap-2 animate-fade-up" style={{animationDelay:`${i*80}ms`}}>
                  <span className="grid place-items-center h-6 w-6 rounded-full bg-primary text-primary-foreground"><Check className="h-4 w-4"/></span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-6"><CTAButton to="/resume-ai" variant="primary">Improve My Resume</CTAButton></div>
          </div>
          <div className="order-1 md:order-2">
            <ResumePreviewCard />
          </div>
        </section>

        {/* Search CTA */}
        <section className="container mx-auto pb-16">
          <div className="rounded-3xl bg-secondary p-6 md:p-10">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">FIND YOUR PERFECT JOB IN A CLICK!</h2>
            <div className="grid md:grid-cols-4 gap-3">
              <input 
                placeholder="Job Title" 
                className="h-12 rounded-full px-4 border" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <input 
                placeholder="City" 
                className="h-12 rounded-full px-4 border" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <select 
                className="h-12 rounded-full px-4 border"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="any">Any Experience</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
              </select>
              <CTAButton onClick={handleSearch} variant="dark">GO</CTAButton>
            </div>
          </div>
        </section>

        {/* Journey CTA */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 via-teal-100 to-cyan-200 dark:from-cyan-900/30 dark:via-teal-900/30 dark:to-cyan-900/30" />
          <div className="container mx-auto relative py-12 text-center">
            <h3 className="text-xl md:text-2xl font-semibold mb-4">Ensure a Fast and Successful Journey to Your Next Career Move</h3>
            <Link to="/job-seekers" className="inline-flex px-6 py-3 rounded-full bg-foreground text-background font-semibold">Try ApexPath for Free</Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
