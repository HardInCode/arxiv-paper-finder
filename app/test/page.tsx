'use client';

import { useState, useEffect } from 'react';
import PaperCard from '@/components/PaperCard';
import { Paper } from '@/types/paper';

export default function TestPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchMockData() {
      try {
        const response = await fetch('/api/mock');
        const data = await response.json();
        setPapers(data.papers);
      } catch (error) {
        console.error('Error fetching mock data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMockData();
  }, []);
  
  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">Testing Abstract Display</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-10 flex justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-primary mb-6"></div>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Loading sample papers...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Testing Abstract Display</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-8">
        This page shows sample papers with properly formatted abstracts. Test the "Show More" / "Show Less" buttons to
        ensure they work correctly.
      </p>
      
      <div className="space-y-6">
        {papers.map((paper) => (
          <PaperCard key={paper.arxivId} paper={paper} />
        ))}
      </div>
    </div>
  );
} 