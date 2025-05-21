'use client';

import { useState, useEffect } from 'react';
import { Paper } from '@/types/paper';

interface PaperCardProps {
  paper: Paper;
  isSelected?: boolean;
  onToggleSelect?: (paper: Paper) => void;
}

export default function PaperCard({ paper, isSelected, onToggleSelect }: PaperCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [formattedAbstract, setFormattedAbstract] = useState<string[]>([]);
  
  // Format abstract when component mounts or when paper changes
  useEffect(() => {
    if (paper.abstract) {
      setFormattedAbstract(formatAbstractText(paper.abstract));
    }
  }, [paper.abstract]);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const handleDownload = async () => {
    setDownloading(true);
    
    try {
      // Make sure we have the correct PDF URL
      let pdfUrl = paper.pdfUrl;
      
      // Ensure URL has .pdf extension
      if (!pdfUrl.endsWith('.pdf')) {
        pdfUrl = `${pdfUrl}.pdf`;
      }
      
      // Fix common URL issues
      if (pdfUrl.includes('abs') && !pdfUrl.includes('pdf')) {
        pdfUrl = pdfUrl.replace('/abs/', '/pdf/');
      }
      
      // Use our API endpoint to trigger a download
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: pdfUrl, filename: `${paper.arxivId}.pdf` }),
      });
      
      if (response.ok) {
        // Get the blob from the response
        const blob = await response.blob();
        
        // Create a temporary download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${paper.arxivId}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        
        console.log(`Downloaded: ${paper.arxivId}.pdf`);
      } else {
        throw new Error('Download failed');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download the PDF. Please try again later.');
    } finally {
      setDownloading(false);
    }
  };
  
  // Format abstract text with proper paragraph and line handling
  // Using the advanced approach from ArxivWebScrap1.js
  const formatAbstractText = (abstract: string): string[] => {
    if (!abstract) return ['No abstract available'];
    
    // Clean up the abstract text
    const cleanAbstract = abstract
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\n{3,}/g, '\n\n')  // Collapse multiple blank lines
      .trim();
    
    // Split into paragraphs (preserving intentional paragraph breaks)
    const paragraphs = cleanAbstract
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    // If no paragraphs found, just return the cleaned abstract as a single paragraph
    if (paragraphs.length === 0) {
      return [cleanAbstract];
    }
    
    return paragraphs;
  };
  
  // Format publication date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateString.substring(0, 10);
    }
  };
  
  // Get relevance indicator based on score
  const getRelevanceIndicator = (score?: number) => {
    // Safety check for NaN or invalid values
    if (score === undefined || score === null || isNaN(score)) return { 
      text: 'Relevance Unknown', 
      className: 'bg-gray-300 text-gray-700',
      stars: '?????'
    };
    
    // Make sure score is a number and within valid range
    const validScore = Math.min(10, Math.max(0, Number(score)));
    
    if (validScore === 10) return { 
      text: 'Perfect Match', 
      className: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
      stars: '★★★★★'
    };
    if (validScore >= 8) return { 
      text: 'High Relevance', 
      className: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white',
      stars: '★★★★☆'
    };
    if (validScore >= 6) return { 
      text: 'Medium Relevance', 
      className: 'bg-gradient-to-r from-yellow-300 to-amber-400 text-gray-800',
      stars: '★★★☆☆'
    };
    if (validScore >= 4) return { 
      text: 'Low Relevance', 
      className: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800',
      stars: '★★☆☆☆'
    };
    if (validScore >= 1) return { 
      text: 'Minimal Relevance', 
      className: 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-600',
      stars: '★☆☆☆☆'
    };
    
    // Handle zero specifically
    return { 
      text: 'No Relevance', 
      className: 'bg-gradient-to-r from-red-200 to-red-300 text-gray-700',
      stars: '☆☆☆☆☆'
    };
  };
  
  const relevance = getRelevanceIndicator(paper.relevanceScore);
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
      <div className="p-6">
        <div className="flex justify-between">
          <div className="w-full">
            {/* Header with categories and relevance */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 shadow-sm">
                {paper.primaryCategory}
              </span>
              
              {paper.relevanceScore !== undefined && relevance && (
                <span className={`px-3 py-1.5 text-xs font-medium rounded-full shadow-sm ${relevance.className} flex items-center`}>
                  <span className="mr-1.5">{relevance.stars}</span>
                  {relevance.text} ({paper.relevanceScore}/10)
                </span>
              )}
              
              {paper.relevanceTopic && (
                <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-sm">
                  {paper.relevanceTopic}
                </span>
              )}
            </div>
            
            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 leading-tight">
              {paper.title}
            </h3>
            
            {/* ArXiv ID - Added */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              arXiv ID: {paper.arxivId}
            </p>
            
            {/* Authors */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {paper.authorText}
            </p>
            
            {/* Publication date */}
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Published: {formatDate(paper.published)} 
              {paper.updated && ` • Updated: ${formatDate(paper.updated)}`}
            </p>
            
            {/* Abstract - Enhanced formatting */}
            <div className="mb-5">
              <div 
                className={`relative bg-gray-50 dark:bg-gray-900/30 p-4 border border-gray-100 dark:border-gray-700 rounded-lg 
                  transition-all duration-300 ease-in-out ${expanded ? 'max-h-none' : 'max-h-32 overflow-hidden'}`}
              >
                {formattedAbstract.map((paragraph, idx) => (
                  <p 
                    key={idx} 
                    className="text-sm text-gray-700 dark:text-gray-300 mb-2 last:mb-0 leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
                
                {/* Gradient fade for collapsed state */}
                {!expanded && formattedAbstract.join('').length > 250 && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 dark:from-gray-900/30 to-transparent pointer-events-none"></div>
                )}
              </div>
              
              {/* Character count */}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Abstract: {paper.abstract.length} characters, {formattedAbstract.length} paragraph(s)
                {formattedAbstract.join('').length > 250 && (
                  <button 
                    onClick={toggleExpand} 
                    className="ml-2 text-primary hover:underline focus:outline-none"
                  >
                    {expanded ? "Collapse" : "Expand"}
                  </button>
                )}
              </div>
            </div>
            
            {/* PDF URL - Added for debugging */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
              PDF URL: <span className="font-mono">{paper.pdfUrl}</span>
            </p>
            
            {/* Additional categories if any */}
            {paper.categories && paper.categories.length > 1 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-1.5 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  All categories:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {paper.categories.map(category => (
                    <span key={category} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={toggleExpand}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-light dark:hover:bg-primary/30 transition-colors"
          >
            {expanded ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Show Less
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Show More
              </>
            )}
          </button>
          
          <div className="flex gap-3">
            <a 
              href={paper.pdfUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View on arXiv
            </a>
            
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 dark:bg-gradient-to-r dark:from-primary dark:to-secondary dark:hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {downloading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 