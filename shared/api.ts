
// shared/api.ts - Types shared between frontend and backend

export interface RecommendationResponse {
  skillGaps?: string[];
  plan?: PlanItem[];
  atsScore?: number;
  atsRecommendations?: string[];
  raw?: string;
}

export interface PlanItem {
  title: string;
  description?: string;
  resources?: Resource[];
  expected_weeks?: number;
}

export interface Resource {
  name: string;
  url?: string;
}

export interface CatalogItem {
  id?: string;
  title: string;
  description: string;
  type: 'course' | 'certification' | 'resource';
  url?: string;
  link?: string;
  provider?: string;
  duration?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  skills?: string[];
}

export interface UploadResumeRequest {
  fileName: string;
  mimeType: string;
  contentBase64?: string;
}

export interface UploadResumeResponse {
  id: string;
  fileName: string;
  mimeType: string;
}

export interface RecommendationRequest {
  resume: string; // base64 PDF data
  jobDescription?: string;
  optimizeResume?: boolean;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}