'use client';

import { useState } from 'react';
import Link from 'next/link';
import SearchForm from '@/components/SearchForm';
import ResultsList from '@/components/ResultsList';
import { Paper } from '@/types/paper';

export default function Home() {
  const [results, setResults] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold tracking-tight">
            arXiv Paper Finder
          </h1>
          <p className="mt-3 text-lg font-light opacity-90">
            Discover, filter and download academic papers with intelligent relevance scoring
          </p>
          
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/test" className="inline-flex items-center text-primary hover:underline">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
              View Test Page with Sample Papers
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-6">
              <SearchForm 
                setResults={setResults}
                setLoading={setLoading}
                setError={setError}
              />
            </div>
          </div>
          
          <div className="lg:col-span-8 xl:col-span-9">
            <ResultsList 
              results={results}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-center md:text-left mb-4 md:mb-0">
              arXiv Paper Finder — Built with Next.js and Tailwind CSS
            </p>
            <div className="flex space-x-4">
              <a href="https://arxiv.org" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                arXiv.org
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
