export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'sales_staff';
  createdAt?: string;
}

export interface ComparisonBrief {
  executiveSummary: string;
  comparisonTable: Array<{
    feature: string;
    competitor: string;
    ours: string;
    keyAdvantages: string;
    valueProposition: string;
  }>;
  advantages: string[];
  valueProposition: string;
  talkingPoints: string[];
  objectionHandling: Array<{
    objection: string;
    response: string;
  }>;
  recommendation: string;
}

export interface Comparison {
  id: number;
  user_id: number;
  staff_name: string;
  staff_email?: string;
  competitor_product: string;
  competitor_brand?: string;
  competitor_features?: string;
  customer_requirements?: string;
  our_product: string;
  our_features?: string;
  response: ComparisonBrief; // The parsed JSON brief
  rating?: number | null;
  created_at: string;
}

export interface Feedback {
  id: number;
  rating: number;
  comment?: string;
  created_at: string;
  staff_name: string;
  comparison: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  features: string;
  createdAt?: string;
}

export interface Template {
  id: number;
  name: string;
  preset_data: {
    competitor_product: string;
    competitor_brand?: string;
    competitor_features?: string;
    customer_requirements?: string;
    our_product: string;
    our_features?: string;
    additional_notes?: string;
  };
}

export interface AIPrompt {
  id: number;
  name: string;
  systemPrompt: string;
  isActive: boolean;
  createdAt: string;
}

export interface AnalyticsStats {
  totalGenerations: number;
  totalUsers: number;
  averageRating: number;
  todayGenerations: number;
}

export interface AnalyticsCharts {
  daily: Array<{ date: string; count: number }>;
  monthly: Array<{ month: string; count: number }>;
  topCompetitor: Array<{ name: string; count: number }>;
}

export interface AnalyticsResponse {
  stats: AnalyticsStats;
  charts: AnalyticsCharts;
}
