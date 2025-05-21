export interface Paper {
  title: string;
  abstract: string;
  authors: string[];
  authorText: string;
  published: string;
  updated: string;
  pdfUrl: string;
  arxivId: string;
  categories: string[];
  primaryCategory: string;
  relevanceScore?: number;
  relevanceTopic?: string;
}

export interface SearchParams {
  searchMode: 'basic' | 'category';
  searchField: 'all' | 'ti' | 'au' | 'abs';
  searchTerms: string;
  categories: string[];
  maxResults: number;
}

export type CategoryOption = {
  id: string;
  name: string;
}; 