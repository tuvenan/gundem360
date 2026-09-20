export type NewsTone = "formal" | "breaking" | "analytical" | "editorial";
export type NewsLength = "short" | "medium" | "long";

export interface AIGenerateRequest {
  rawContent: string;
  category?: string;
  tone?: NewsTone;
  length?: NewsLength;
  includeBadge?: boolean;
  providerId?: string;
  model?: string;
}

export interface AIGeneratedNewsResponse {
  title: string;
  slug: string;
  summary: string;
  content: string; // Zengin HTML
  category: string;
  categoryTitle: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  readTimeMinutes: number;
  imageBadgeText?: string;
  imageBadgeColor?: string;
  imageUrl: string;
  imagePrompt?: string;
}
