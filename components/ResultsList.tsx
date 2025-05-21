'use client';

import { useState, useEffect } from 'react';
import { Paper } from '@/types/paper';
import PaperCard from '@/components/PaperCard';

interface ResultsListProps {
  results: Paper[];
  loading: boolean;
  error: string | null;
}

export default function ResultsList({ results, loading, error }: ResultsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [batchDownloading, setBatchDownloading] = useState(false);
  const [relevanceFilter, setRelevanceFilter] = useState<number | null>(null);
  const [filteredResults, setFilteredResults] = useState<Paper[]>([]);
  const resultsPerPage = 10;

  // Reset selections when results change
  useEffect(() => {
    setSelectedPapers([]);
    setCurrentPage(1);
    setFilteredResults(results);
  }, [results]);

  // Apply relevance filter
  useEffect(() => {
    if (relevanceFilter === null) {
      setFilteredResults(results);
    } else {
      setFilteredResults(results.filter(paper => {
        // Ensure every paper has at least a default relevance score
        const score = paper.relevanceScore !== undefined ? paper.relevanceScore : 0;
        
        // Apply the correct filter based on the selected value
        switch(relevanceFilter) {
          case 10: // Perfect Match (10/10)
            return score === 10;
          case 8: // High Relevance (8-10/10)
            return score >= 8;
          case 6: // Medium or Higher (6-10/10)
            return score >= 6;
          case 5: // At least 5/10
            return score >= 5;
          case 0: // Show all (including 0 scores)
            return true;
          default:
            return true;
        }
      }));
    }
    setCurrentPage(1);
  }, [relevanceFilter, results]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = filteredResults.slice(indexOfFirstResult, indexOfLastResult);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Handle paper selection
  const togglePaperSelection = (arxivId: string) => {
    setSelectedPapers(prev => 
      prev.includes(arxivId)
        ? prev.filter(id => id !== arxivId)
        : [...prev, arxivId]
    );
  };

  // Select all papers on current page
  const selectAllOnPage = () => {
    const allPageIds = currentResults.map(paper => paper.arxivId);
    
    if (allPageIds.every(id => selectedPapers.includes(id))) {
      // If all are selected, deselect them
      setSelectedPapers(prev => prev.filter(id => !allPageIds.includes(id)));
    } else {
      // Otherwise, add all that aren't already selected
      const newSelection = [...selectedPapers];
      allPageIds.forEach(id => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      setSelectedPapers(newSelection);
    }
  };

  // Handle batch download
  const downloadSelectedPapers = async () => {
    if (selectedPapers.length === 0) return;
    
    setBatchDownloading(true);
    
    try {
      for (const arxivId of selectedPapers) {
        await downloadPaper(arxivId);
        // Add a small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      alert(`Successfully downloaded ${selectedPapers.length} papers.`);
      setSelectedPapers([]);
    } catch (err) {
      console.error('Batch download error:', err);
      alert('Some downloads failed. Please try again.');
    } finally {
      setBatchDownloading(false);
    }
  };

  // Download a single paper
  const downloadPaper = async (arxivId: string) => {
    const response = await fetch(`/api/download?arxivId=${arxivId}`);
      
    if (!response.ok) {
      throw new Error(`Failed to download paper ${arxivId}`);
    }
    
    // Create a link to download the PDF
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${arxivId.replace(/\//g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Filter options by relevance score
  const relevanceOptions = [
    { value: null, label: 'All Papers' },
    { value: 10, label: 'Perfect Match (exactly 10/10)' },
    { value: 8, label: 'High Relevance (8-10/10)' },
    { value: 6, label: 'Medium Relevance (6-10/10)' },
    { value: 5, label: 'Low Relevance (5-10/10)' },
    { value: 0, label: 'All Papers with Scores' }
  ];

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-10 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-primary mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading papers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-5 mb-5 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">
                {error}
              </p>
            </div>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300">Please try adjusting your search parameters</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-10">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">No Results Yet</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Use the search form to find academic papers on arXiv. You can filter by topic, category, or use specialized search presets.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Search Results 
          <span className="ml-2 px-3 py-1 text-sm font-semibold rounded-full bg-primary/10 text-primary dark:bg-primary/20">
            {filteredResults.length}
          </span>
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Relevance Filter */}
          <div className="flex items-center">
            <label htmlFor="relevanceFilter" className="mr-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
              Filter by relevance:
            </label>
            <select
              id="relevanceFilter"
              value={relevanceFilter === null ? 'null' : relevanceFilter.toString()}
              onChange={(e) => setRelevanceFilter(e.target.value === 'null' ? null : Number(e.target.value))}
              className="text-sm border border-gray-300 rounded-lg py-2 px-3 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {relevanceOptions.map(option => (
                <option 
                  key={option.value === null ? 'null' : option.value} 
                  value={option.value === null ? 'null' : option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Batch Download Button */}
          {selectedPapers.length > 0 && (
            <button
              onClick={downloadSelectedPapers}
              disabled={batchDownloading}
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-success to-green-500 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {batchDownloading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Downloading {selectedPapers.length} papers...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download {selectedPapers.length} selected
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        {/* Select All Checkbox */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-primary rounded-sm border-gray-300 focus:ring-primary"
              checked={currentResults.length > 0 && currentResults.every(paper => selectedPapers.includes(paper.arxivId))}
              onChange={selectAllOnPage}
            />
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Select all on this page
            </span>
          </label>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Showing {indexOfFirstResult + 1}-{Math.min(indexOfLastResult, filteredResults.length)} of {filteredResults.length}
          </div>
        </div>

        <div className="space-y-6 p-4">
          {currentResults.map((paper) => (
            <div key={paper.arxivId} className="flex">
              <div className="flex items-start pt-4 pl-2 pr-3">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-primary rounded-sm border-gray-300 focus:ring-primary"
                  checked={selectedPapers.includes(paper.arxivId)}
                  onChange={() => togglePaperSelection(paper.arxivId)}
                />
              </div>
              <div className="flex-grow">
                <PaperCard key={paper.arxivId} paper={paper} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg flex items-center ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          
          <div className="flex">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`w-10 h-10 mx-1 flex items-center justify-center rounded-lg ${
                  currentPage === i + 1
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg flex items-center ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Selected Papers Summary */}
      {selectedPapers.length > 0 && (
        <div className="mt-6 p-4 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20 dark:border-primary/30">
          <p className="text-sm text-primary dark:text-primary-light flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{selectedPapers.length}</span> paper{selectedPapers.length > 1 ? 's' : ''} selected for batch download
          </p>
        </div>
      )}
    </div>
  );
} 