import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Define the type for a single job result
interface Job {
  job_id: number;
  title: string;
  company_name: string;
  location: string;
  description: string;
  // Add any other properties that the API returns
}

// Define the type for the API response
interface SearchResponse {
  results: Job[];
  totalPages: number;
  totalResults: number;
}

const fetchJobs = async (query: string | null, location: string | null, page: number) => {
  const params = new URLSearchParams();
  if (query) params.append("query", query);
  if (location) params.append("location", location);
  params.append("page", page.toString());

  const response = await fetch(`http://localhost:5001/search-jobs?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query");
  const location = searchParams.get("location");
  const page = parseInt(searchParams.get("page") || "1", 10);

  const { data, isLoading, isError, error } = useQuery<SearchResponse, Error>({
    queryKey: ["searchJobs", query, location, page],
    queryFn: () => fetchJobs(query, location, page),
    enabled: !!query || !!location, // Only run query if there's a query or location
  });

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", newPage.toString());
      return newParams;
    }, { replace: true });
  };

  const jobs = data?.results;
  const totalPages = data?.totalPages;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            Search Results
            {(query || location) && <span className="text-gray-500 dark:text-gray-400 font-normal"> for </span>}
            {query && <span className="text-primary">"{query}"</span>}
            {query && location && <span className="text-gray-500 dark:text-gray-400 font-normal"> in </span>}
            {location && <span className="text-primary">"{location}"</span>}
          </h1>
          {data?.totalResults !== undefined && !isLoading && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Showing {jobs?.length} of {data.totalResults} results.
            </p>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4 text-lg text-gray-600 dark:text-gray-400">Searching for jobs...</p>
            </div>
          )}

          {isError && (
            <div className="text-red-500 text-center py-16 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="font-semibold">Error fetching jobs:</p>
              <p>{error.message}</p>
            </div>
          )}

          {jobs && jobs.length === 0 && !isLoading && (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No jobs found</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search terms.</p>
            </div>
          )}

          {jobs && jobs.length > 0 && (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.job_id} className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">{job.title}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.company_name} - <span className="font-medium text-gray-700 dark:text-gray-300">{job.location}</span></p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{job.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {totalPages && totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
