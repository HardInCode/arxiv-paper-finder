'use client';

import { useState } from 'react';
import { Paper, SearchParams, CategoryOption } from '@/types/paper';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

// CS Categories data from the original scripts
const CS_CATEGORIES: CategoryOption[] = [
  { id: 'cs.AI', name: 'Artificial Intelligence' },
  { id: 'cs.AR', name: 'Hardware Architecture' },
  { id: 'cs.CC', name: 'Computational Complexity' },
  { id: 'cs.CE', name: 'Computational Engineering' },
  { id: 'cs.CG', name: 'Computational Geometry' },
  { id: 'cs.CL', name: 'Computation and Language' },
  { id: 'cs.CR', name: 'Cryptography and Security' },
  { id: 'cs.CV', name: 'Computer Vision and Pattern Recognition' },
  { id: 'cs.CY', name: 'Computers and Society' },
  { id: 'cs.DB', name: 'Databases' },
  { id: 'cs.DC', name: 'Distributed Computing' },
  { id: 'cs.DL', name: 'Digital Libraries' },
  { id: 'cs.DM', name: 'Discrete Mathematics' },
  { id: 'cs.DS', name: 'Data Structures and Algorithms' },
  { id: 'cs.ET', name: 'Emerging Technologies' },
  { id: 'cs.FL', name: 'Formal Languages and Automata Theory' },
  { id: 'cs.GL', name: 'General Literature' },
  { id: 'cs.GR', name: 'Graphics' },
  { id: 'cs.GT', name: 'Computer Science and Game Theory' },
  { id: 'cs.HC', name: 'Human-Computer Interaction' },
  { id: 'cs.IR', name: 'Information Retrieval' },
  { id: 'cs.IT', name: 'Information Theory' },
  { id: 'cs.LG', name: 'Machine Learning' },
  { id: 'cs.LO', name: 'Logic in Computer Science' },
  { id: 'cs.MA', name: 'Multiagent Systems' },
  { id: 'cs.MM', name: 'Multimedia' },
  { id: 'cs.MS', name: 'Mathematical Software' },
  { id: 'cs.NA', name: 'Numerical Analysis' },
  { id: 'cs.NE', name: 'Neural and Evolutionary Computing' },
  { id: 'cs.NI', name: 'Networking and Internet Architecture' },
  { id: 'cs.OH', name: 'Other Computer Science' },
  { id: 'cs.OS', name: 'Operating Systems' },
  { id: 'cs.PF', name: 'Performance' },
  { id: 'cs.PL', name: 'Programming Languages' },
  { id: 'cs.RO', name: 'Robotics' },
  { id: 'cs.SC', name: 'Symbolic Computation' },
  { id: 'cs.SD', name: 'Sound' },
  { id: 'cs.SE', name: 'Software Engineering' },
  { id: 'cs.SI', name: 'Social and Information Networks' },
  { id: 'cs.SY', name: 'Systems and Control' }
];

// Common CS categories for quick selection
const COMMON_CATEGORIES: CategoryOption[] = [
  { id: 'cs.CR', name: 'Cryptography and Security' },
  { id: 'cs.AI', name: 'Artificial Intelligence' },
  { id: 'cs.CL', name: 'Computation and Language' },
  { id: 'cs.CV', name: 'Computer Vision and Pattern Recognition' },
  { id: 'cs.LG', name: 'Machine Learning' },
  { id: 'cs.NE', name: 'Neural and Evolutionary Computing' },
  { id: 'cs.SI', name: 'Social and Information Networks' },
  { id: 'cs.SE', name: 'Software Engineering' },
  { id: 'cs.DB', name: 'Databases' },
  { id: 'cs.NI', name: 'Networking and Internet Architecture' },
  { id: 'cs.PL', name: 'Programming Languages' },
  { id: 'cs.RO', name: 'Robotics' }
];

// Specialized topic presets from the original script
const TOPIC_PRESETS = [
  {
    id: "RF Analysis",
    name: "RF Analysis",
    description: "Radio frequency analysis, spectrum analysis, RF characterization",
  },
  {
    id: "RF Capture",
    name: "RF Capture",
    description: "RF signal capture, acquisition, and recording techniques",
  },
  {
    id: "RF Simulation",
    name: "RF Simulation",
    description: "Simulation and modeling of radio frequency systems",
  },
  {
    id: "Quantum Cryptography",
    name: "Quantum Cryptography",
    description: "Quantum cryptography, quantum key distribution, post-quantum crypto",
  },
  {
    id: "Classical Cryptography",
    name: "Classical Cryptography",
    description: "Traditional cryptography, encryption algorithms and protocols",
  },
  {
    id: "Web Security",
    name: "Web Security",
    description: "Web application security, vulnerabilities, and protection",
  },
  {
    id: "Social Engineering & Human Factor",
    name: "Social Engineering",
    description: "Social engineering attacks and the human factor in cybersecurity",
  }
];

// Add the functions from the API route directly in the component
function buildApiQuery(searchMode: string, searchField: string, searchTerms: string, categories: string[]) {
  if (searchMode === 'category') {
    // Format: cat:cs.CR AND all:quantum
    const categoryQuery = categories.map(cat => `cat:${cat}`).join('+OR+');
    
    if (!searchTerms || searchTerms.trim() === '') {
      // Just categories, no search terms
      return categoryQuery;
    } else {
      // Categories AND search terms
      const searchQuery = `${searchField}:${encodeURIComponent(searchTerms).replace(/%20/g, '+')}`;
      return `(${categoryQuery})+AND+(${searchQuery})`;
    }
  } else if (searchMode === 'preset') {
    // Not implemented in the queryBuilder but handled separately
    return '';
  } else {
    // Basic search mode: just use the search field and terms
    return `${searchField}:${encodeURIComponent(searchTerms).replace(/%20/g, '+')}`;
  }
}

function extractAuthors(entry: any) {
  if (!entry.author) return [];
  
  // Handle both single author and multiple authors cases
  const authors = Array.isArray(entry.author) ? entry.author : [entry.author];
  return authors.map((author: any) => author.name || 'Unknown');
}

// Helper function to evaluate search terms against paper content
function evaluateSearchTerms(title: string, abstract: string, searchTermsString: string): number {
  if (!title || !abstract || !searchTermsString) {
    return 5; // Default score if inputs are missing
  }
  
  // Convert inputs to lowercase for consistent comparison
  const titleLower = String(title).toLowerCase();
  const abstractLower = String(abstract).toLowerCase();
  const searchTermsLower = String(searchTermsString).toLowerCase();
  
  // Count occurrences of search terms in title and abstract
  let score = 0;
  const terms = searchTermsLower.split(/\s+/);
  
  // Track how many terms matched
  let matchedTerms = 0;
  let totalTerms = 0;
  
  for (const term of terms) {
    if (!term || term.length < 3) continue; // Skip very short terms
    
    totalTerms++;
    
    // Title matches are worth more
    if (titleLower.includes(term)) {
      score += 3;
      matchedTerms++;
    }
    
    // Abstract matches
    if (abstractLower.includes(term)) {
      score += 1;
      // Only count as matched if not already counted from title
      if (!titleLower.includes(term)) {
        matchedTerms++;
      }
    }
  }
  
  // Ensure we don't divide by zero
  if (totalTerms > 0) {
    const matchPercentage = matchedTerms / totalTerms;
    if (matchPercentage > 0.8) {
      score += 3; // Major boost for covering most terms
    } else if (matchPercentage > 0.5) {
      score += 2; // Medium boost
    } else if (matchPercentage > 0.3) {
      score += 1; // Minor boost
    }
  }
  
  // Domain-specific boosts based on search topics
  if (searchTermsLower.includes('quantum')) {
    if (titleLower.includes('quantum')) {
      score += 2;
    }
  }
  
  if (searchTermsLower.includes('machine learning') || searchTermsLower.includes('artificial intelligence')) {
    if (titleLower.includes('machine learning') || titleLower.includes('artificial intelligence') || titleLower.includes('neural network')) {
      score += 2;
    }
  }
  
  if (searchTermsLower.includes('security') || searchTermsLower.includes('cryptography')) {
    if (titleLower.includes('security') || titleLower.includes('cryptography') || titleLower.includes('encryption')) {
      score += 2;
    }
  }
  
  // Ensure we return a valid number between 1-10
  return isNaN(score) ? 5 : Math.min(10, Math.max(1, score));
}

// Helper function to calculate content-based relevance score without search terms
function calculateContentBasedScore(title: string, abstract: string): number {
  if (!title || !abstract) {
    return 5; // Default score if inputs are missing
  }
  
  // Convert inputs to lowercase for consistent comparison
  const titleLower = String(title).toLowerCase();
  const abstractLower = String(abstract).toLowerCase();
  
  let score = 3; // Start with a base score
  
  // Check for important research areas in the title
  const importantAreas = [
    'quantum', 'machine learning', 'deep learning', 'neural', 'security', 
    'cryptography', 'algorithm', 'network', 'computer vision', 'language'
  ];
  
  for (const area of importantAreas) {
    if (titleLower.includes(area)) {
      score += 1.5;
    } else if (abstractLower.includes(area)) {
      score += 0.5;
    }
  }
  
  // Boost for papers with specific characteristics
  if (titleLower.includes('quantum computing')) {
    score += 2;
  } else if (titleLower.includes('machine learning') || titleLower.includes('artificial intelligence')) {
    score += 1.5;
  } else if (titleLower.includes('deep learning') || titleLower.includes('neural network')) {
    score += 1.5;
  } else if (titleLower.includes('security') || titleLower.includes('cryptography')) {
    score += 1.5;
  }
  
  // Ensure we return a valid number between 1-10
  return isNaN(score) ? 5 : Math.min(10, Math.max(1, score));
}

// Helper function to calculate fallback relevance score for presets
function calculateFallbackRelevanceScore(title: string, abstract: string, topicName: string): number {
  // Specific scores based on topic name
  switch(topicName) {
    case "RF Analysis":
    case "RF Capture":
    case "RF Simulation":
      if (title.includes('radio') || title.includes('frequency') || title.includes('rf') || 
          title.includes('electromagnetic') || title.includes('spectrum')) {
        return 8;
      } else if (abstract.includes('radio') && abstract.includes('frequency')) {
        return 6;
      }
      return 3;
      
    case "Quantum Cryptography":
      if (title.includes('quantum') && title.includes('cryptography')) {
        return 9;
      } else if (title.includes('quantum') || title.includes('cryptography')) {
        return 7;
      } else if (abstract.includes('quantum') && abstract.includes('cryptography')) {
        return 6;
      }
      return 3;
      
    case "Classical Cryptography":
      if (title.includes('cryptography') || title.includes('encryption') || title.includes('cipher')) {
        return 8;
      } else if (abstract.includes('cryptography') && abstract.includes('security')) {
        return 6;
      }
      return 3;
      
    case "Web Security":
      if (title.includes('web') && title.includes('security')) {
        return 9;
      } else if (title.includes('web') || title.includes('security')) {
        return 7;
      } else if (abstract.includes('web') && abstract.includes('vulnerability')) {
        return 6;
      }
      return 3;
      
    case "Social Engineering & Human Factor":
      if (title.includes('social engineering') || 
         (title.includes('social') && title.includes('engineering'))) {
        return 9;
      } else if (title.includes('phishing') || title.includes('social') && title.includes('cybersecurity')) {
        return 7;
      }
      return 3;
      
    default:
      return 4; // Default medium-low score
  }
}

function parseFeed(xml: string, relevanceTopic?: string, isOfflineMode?: boolean) {
  const parser = new XMLParser({ 
    ignoreAttributes: false, 
    attributeNamePrefix: '',
    isArray: (name) => ['author', 'link', 'category'].includes(name)
  });
  
  try {
    const json = parser.parse(xml);
    if (!json.feed || !json.feed.entry) {
      return [];
    }
    
    // Handle both single entry and multiple entries
    const entries = Array.isArray(json.feed.entry) ? json.feed.entry : [json.feed.entry];
    
    const papers = entries.map((e: any) => {
      // Extract PDF link
      let pdfLink = null;
      if (e.link) {
        const links = Array.isArray(e.link) ? e.link : [e.link];
        for (const link of links) {
          if (link && link.title === 'pdf' && link.href) {
            pdfLink = link.href.endsWith('.pdf') ? link.href : link.href + '.pdf';
            break;
          }
        }
      }
      
      if (!pdfLink && e.id) {
        // Fallback: construct PDF URL from ID
        pdfLink = e.id.replace('http://arxiv.org/abs/', 'http://arxiv.org/pdf/').replace(/v\d+$/, '') + '.pdf';
      }

      // Extract authors
      const authors = extractAuthors(e);
      
      // Extract categories
      let categories = [];
      if (e.category) {
        categories = Array.isArray(e.category) 
          ? e.category.map((cat: any) => cat.term) 
          : [e.category.term];
      }
      
      // Extract arxiv ID
      const arxivId = e.id ? e.id.split('/').pop() : 'unknown';
      
      // Clean and sanitize text fields
      const title = (e.title || '').replace(/\s+/g, ' ').trim();
      
      // Process abstract properly - inspired by ArxivWebScrap1.js
      let abstract = 'No abstract available';
      if (e.summary) {
        abstract = e.summary
          .replace(/\r\n/g, '\n')  // Normalize line endings
          .replace(/\n{3,}/g, '\n\n')  // Collapse multiple blank lines
          .replace(/\s{2,}/g, ' ')  // Replace multiple spaces with single space 
          .replace(/\$([^$]+)\$/g, '$1') // Simple LaTeX math cleanup (for display only)
          .trim();
      }

      const paper: Paper = {
        title: title,
        abstract: abstract,
        authors: authors,
        authorText: authors.join(', '),
        published: e.published || 'Unknown date',
        updated: e.updated || '',
        pdfUrl: pdfLink,
        arxivId: arxivId,
        categories: categories,
        primaryCategory: categories.length > 0 ? categories[0] : 'Unknown',
      };
      
      // Add relevance scoring for preset topics
      if (relevanceTopic && TOPIC_PRESETS_DATA[relevanceTopic]) {
        paper.relevanceTopic = relevanceTopic;
        paper.relevanceScore = calculateRelevanceScore(title, abstract, relevanceTopic);
      }
      
      return paper;
    });

    // For sample data or offline mode, ensure all papers have relevance scores
    if (isOfflineMode || entries.length <= 5) {
      // Check if papers need scores (don't already have them from a preset)
      papers.forEach((paper, index) => {
        if (paper.relevanceScore === undefined) {
          const title = paper.title.toLowerCase();
          const abstract = paper.abstract.toLowerCase();
          
          // Calculate score based on title and abstract content
          let score = 5; // Default medium score
          let topic = relevanceTopic || "Sample Results";
          
          // Use calculateContentBasedScore for more accurate scoring
          score = calculateContentBasedScore(title, abstract);
          
          // Ensure score is within 0-10 range
          paper.relevanceScore = Math.max(1, Math.min(10, score));
          paper.relevanceTopic = topic;
        }
      });
    }
    
    return papers;
  } catch (err) {
    console.error('Error parsing XML:', err);
    return [];
  }
}

/** Calculate an improved relevance score based on topic-specific criteria */
function calculateRelevanceScore(title: string, abstract: string, topicName: string) {
  const preset = TOPIC_PRESETS_DATA[topicName];
  if (!preset) return 5;
  
  // Safety check for inputs
  if (!title || !abstract) {
    return 5; // Default medium score if inputs are missing
  }
  
  // Convert inputs to lowercase for consistent comparison
  const titleText = String(title).toLowerCase();
  const abstractText = String(abstract).toLowerCase();
  const combinedText = titleText + " " + titleText + " " + abstractText; // Title counted twice
  
  // Check for required keywords first - if any are missing, immediately lower score
  let hasRequiredKeywords = true;
  if (preset.requiredKeywords && preset.requiredKeywords.length > 0) {
    for (const req of preset.requiredKeywords) {
      if (!combinedText.includes(req.toLowerCase())) {
        hasRequiredKeywords = false;
        break;
      }
    }
  }
  
  // Check for excluded keywords - if any are present, immediately lower score
  let hasExcludedKeywords = false;
  if (preset.excludedKeywords && preset.excludedKeywords.length > 0) {
    for (const excl of preset.excludedKeywords) {
      if (combinedText.includes(excl.toLowerCase())) {
        hasExcludedKeywords = true;
        break;
      }
    }
  }
  
  // Calculate weighted score based on keyword occurrences and weights
  let weightedScore = 0;
  let totalPossibleScore = 0;
  
  // Keep track of which keywords were actually found
  const foundKeywords = new Set();
  
  for (const [keyword, weight] of Object.entries(preset.keywordWeights)) {
    // Ensure weight is a number
    const numericWeight = Number(weight);
    if (isNaN(numericWeight)) continue;
    
    totalPossibleScore += numericWeight;
    
    // Count occurrences
    let count = 0;
    let pos = combinedText.indexOf(keyword.toLowerCase());
    while (pos !== -1) {
      count++;
      pos = combinedText.indexOf(keyword.toLowerCase(), pos + 1);
    }
    
    // Apply diminishing returns for multiple occurrences
    const keywordScore = count > 0 ? numericWeight * Math.min(1, 0.5 + (count / 5)) : 0;
    weightedScore += keywordScore;
    
    // Track which keywords were found
    if (count > 0) {
      foundKeywords.add(keyword);
    }
  }
  
  // Make sure we don't divide by zero
  if (totalPossibleScore === 0) totalPossibleScore = 1;
  
  // If less than half of weighted keywords were found, cap the score
  const keywordPercentage = foundKeywords.size / Math.max(1, Object.keys(preset.keywordWeights).length);
  let maxScoreBasedOnKeywords = 10;
  if (keywordPercentage < 0.5) {
    // Cap at 6 if less than half of keywords found
    maxScoreBasedOnKeywords = 6;
  }
  
  // Normalize score to 0-10 scale with safety check for division by zero
  let normalizedScore = Math.round((weightedScore / totalPossibleScore) * 10);
  if (isNaN(normalizedScore)) normalizedScore = 5;
  
  // Adjust based on required/excluded keywords
  if (!hasRequiredKeywords) {
    normalizedScore = Math.min(normalizedScore, 5); // Cap at 5/10 if missing required keywords
  }
  
  if (hasExcludedKeywords) {
    normalizedScore = Math.min(normalizedScore, 3); // Cap at 3/10 if contains excluded keywords
  }
  
  // Apply cap based on keyword coverage percentage
  normalizedScore = Math.min(normalizedScore, maxScoreBasedOnKeywords);
  
  // For perfect 10/10 scores, require at least 75% of keywords and all required keywords
  if (normalizedScore === 10) {
    // Check if we have sufficient keyword coverage for a perfect score
    if (keywordPercentage < 0.75) {
      normalizedScore = 9; // Downgrade to 9
    }
    
    // Check if we're missing any required keywords
    if (preset.requiredKeywords) {
      for (const req of preset.requiredKeywords) {
        if (!combinedText.includes(req.toLowerCase())) {
          normalizedScore = Math.min(normalizedScore, 7); // Cap at 7 if missing required keywords
          break;
        }
      }
    }
  }
  
  // Check for title match boost - if topic terms appear in the title, boost the score
  const topicTerms = topicName.toLowerCase().split(' ');
  let titleMatchCount = 0;
  
  for (const term of topicTerms) {
    if (term.length > 2 && titleText.includes(term)) {  // Skip very short terms
      titleMatchCount++;
    }
  }
  
  if (titleMatchCount >= topicTerms.filter(t => t.length > 2).length / 2) {
    normalizedScore = Math.min(10, normalizedScore + 1); // Boost if half or more terms match in title
  }
  
  // Final safety check - ensure we return a valid number between 1-10
  return isNaN(normalizedScore) ? 5 : Math.max(1, Math.min(10, normalizedScore));
}

// Define topic presets data structure (copied from API route)
interface TopicPreset {
  searchTerms: string;
  keywordWeights: Record<string, number>;
  requiredKeywords: string[];
  excludedKeywords: string[];
  categories: string[];
  description: string;
}

// Topic presets from the original code
const TOPIC_PRESETS_DATA: Record<string, TopicPreset> = {
  "RF Analysis": {
    searchTerms: "radio frequency analysis spectrum",
    keywordWeights: {
      "radio": 2,
      "frequency": 2, 
      "analysis": 1.5,
      "spectrum": 2,
      "rf": 3,
      "signal": 1,
      "wireless": 1,
      "antenna": 1,
      "electromagnetic": 1.5
    },
    requiredKeywords: ["radio", "frequency", "rf", "spectrum"],
    excludedKeywords: ["quantum", "cryptography", "web security"],
    categories: ["physics.app-ph", "eess.SP", "cs.IT", "physics.ins-det"],
    description: "Papers on radio frequency analysis including spectrum analysis, RF characterization"
  },
  "RF Capture": {
    searchTerms: "radio frequency capture signal acquisition",
    keywordWeights: {
      "radio": 2,
      "frequency": 2,
      "capture": 2,
      "signal": 2,
      "acquisition": 2,
      "rf": 3,
      "receiver": 1.5,
      "sampler": 1.5,
      "recording": 1.5,
      "measurement": 1
    },
    requiredKeywords: ["radio", "frequency", "signal", "capture"],
    excludedKeywords: ["quantum", "cryptography", "web security"],
    categories: ["eess.SP", "physics.ins-det", "cs.IT"],
    description: "Papers on RF signal capture, acquisition, and recording techniques"
  },
  "RF Simulation": {
    searchTerms: "radio frequency simulation modeling",
    keywordWeights: {
      "radio": 2,
      "frequency": 2,
      "simulation": 3,
      "modeling": 2.5,
      "rf": 3,
      "model": 1.5,
      "electromagnetic": 1.5,
      "propagation": 1.5,
      "circuit": 1
    },
    requiredKeywords: ["radio", "frequency", "simulation", "model"],
    excludedKeywords: ["quantum", "cryptography", "web security"],
    categories: ["physics.comp-ph", "cs.CE", "eess.SP"],
    description: "Papers on simulation and modeling of radio frequency systems"
  },
  "Quantum Cryptography": {
    searchTerms: "quantum cryptography encryption",
    keywordWeights: {
      "quantum": 3,
      "cryptography": 2.5,
      "encryption": 1.5,
      "key": 1,
      "distribution": 1,
      "qkd": 3,
      "qubit": 2,
      "entanglement": 2,
      "security": 1,
      "protocol": 1
    },
    requiredKeywords: ["quantum", "cryptography"],
    excludedKeywords: ["radio frequency", "rf", "web application"],
    categories: ["cs.CR", "quant-ph"],
    description: "Papers on quantum cryptography, quantum key distribution, and post-quantum crypto"
  },
  "Classical Cryptography": {
    searchTerms: "cryptography encryption security",
    keywordWeights: {
      "cryptography": 3,
      "encryption": 2.5,
      "security": 1.5,
      "cipher": 2,
      "algorithm": 1,
      "protocol": 1,
      "key": 1,
      "authentication": 1.5,
      "symmetric": 1.5,
      "asymmetric": 1.5
    },
    requiredKeywords: ["cryptography", "encryption", "security"],
    excludedKeywords: ["quantum", "radio frequency", "rf", "web application"],
    categories: ["cs.CR", "cs.IT"],
    description: "Papers on traditional cryptography, encryption algorithms and protocols"
  },
  "Web Security": {
    searchTerms: "web security vulnerability application",
    keywordWeights: {
      "web": 3,
      "security": 2.5,
      "vulnerability": 2,
      "application": 1.5,
      "attack": 1.5,
      "exploit": 1.5,
      "injection": 1.5,
      "xss": 2,
      "csrf": 2,
      "authentication": 1
    },
    requiredKeywords: ["web", "security"],
    excludedKeywords: ["quantum", "radio frequency", "rf"],
    categories: ["cs.CR", "cs.NI", "cs.SE"],
    description: "Papers on web application security, vulnerabilities, and protection"
  },
  "Social Engineering & Human Factor": {
    searchTerms: "social engineering cybersecurity",
    keywordWeights: {
      "social": 2.5,
      "engineering": 2.5,
      "cybersecurity": 3,
      "phishing": 2,
      "human": 1.5,
      "psychology": 1.5,
      "awareness": 1,
      "behavior": 1
    },
    requiredKeywords: ["social", "engineering"],
    excludedKeywords: [],
    categories: ["cs.CY", "cs.CR", "cs.HC", "cs.SI"],
    description: "Papers on social engineering attacks and the human factor in cybersecurity"
  }
};

interface SearchFormProps {
  setResults: React.Dispatch<React.SetStateAction<Paper[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function SearchForm({ setResults, setLoading, setError }: SearchFormProps) {
  const [searchMode, setSearchMode] = useState<'basic' | 'category' | 'preset'>('basic');
  const [searchField, setSearchField] = useState<'all' | 'ti' | 'au' | 'abs'>('all');
  const [searchTerms, setSearchTerms] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxResults, setMaxResults] = useState(10);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [offlineMode, setOfflineMode] = useState(false); // Default to offline mode to avoid CORS issues
  
  // Clear search terms when switching to preset mode
  const handleSearchModeChange = (mode: 'basic' | 'category' | 'preset') => {
    setSearchMode(mode);
    if (mode === 'preset') {
      setSearchTerms(''); // Clear search terms when using preset
    }
  };

  async function fetchArxivFeed(queryString: string, maxResults: number) {
    // If offline mode is enabled, return sample data immediately
    if (offlineMode) {
      console.log('Using offline mode with sample data');
      return getSampleData();
    }

    // Try the direct approach with fetch API first (may work in some environments)
    try {
      console.log('Attempting direct fetch...');
      const directUrl = `http://export.arxiv.org/api/query?search_query=${queryString}&start=0&max_results=${maxResults}`;
      
      const response = await fetch(directUrl, {
        mode: 'cors',
        headers: {
          'Accept': 'application/xml'
        }
      });
      
      if (response.ok) {
        const data = await response.text();
        console.log('Successfully fetched data directly');
        return data;
      }
    } catch (err) {
      console.warn('Direct fetch failed:', err);
    }

    // Only attempt network requests with proxies if offline mode is disabled
    try {
      // First attempt with more reliable CORS proxy
      const corsProxyUrl = `https://corsproxy.org/?${encodeURIComponent(`http://export.arxiv.org/api/query?search_query=${queryString}&start=0&max_results=${maxResults}`)}`;
      
      console.log('Fetching from:', corsProxyUrl);
      const response = await axios.get(corsProxyUrl, {
        timeout: 10000 // Add timeout to prevent hanging requests
      });
      
      // If we got a response with data, return it
      if (response.data) {
        console.log('Successfully fetched data from arXiv via proxy');
        return response.data;
      }
    } catch (err) {
      console.error('First proxy attempt failed:', err);
      
      // Try a second proxy
      try {
        console.log('Trying second proxy method...');
        const allOrigins = `https://api.allorigins.win/raw?url=${encodeURIComponent(`http://export.arxiv.org/api/query?search_query=${queryString}&start=0&max_results=${maxResults}`)}`;
        
        const response = await axios.get(allOrigins, {
          timeout: 10000 // Add timeout to prevent hanging requests
        });
        
        if (response.data) {
          console.log('Successfully fetched data via second proxy');
          return response.data;
        }
      } catch (secondErr) {
        console.error('Second proxy attempt failed:', secondErr);
        
        // Try a third proxy as last resort
        try {
          console.log('Trying third proxy method...');
          const corsAnywhereUrl = `https://cors-anywhere.herokuapp.com/http://export.arxiv.org/api/query?search_query=${queryString}&start=0&max_results=${maxResults}`;
          
          const response = await axios.get(corsAnywhereUrl, {
            timeout: 10000
          });
          
          if (response.data) {
            console.log('Successfully fetched data via third proxy');
            return response.data;
          }
        } catch (thirdErr) {
          console.error('All proxy attempts failed:', thirdErr);
        }
      }
    }
    
    // If we reach here, all attempts failed - switch to offline mode and return sample data
    console.log('All fetch attempts failed. Switching to offline mode with sample data');
    setOfflineMode(true);
    return getSampleData();
  }
  
  // Helper function to provide sample data
  function getSampleData() {
    return `<feed xmlns="http://www.w3.org/2005/Atom">
      <entry>
        <id>http://arxiv.org/abs/2304.01626v3</id>
        <title>Machine Learning Applications in Computer Vision</title>
        <summary>This sample paper demonstrates applications of machine learning techniques to various computer vision problems, including object detection, image segmentation, and scene recognition.</summary>
        <published>2023-04-03T17:50:14Z</published>
        <updated>2023-04-03T17:50:14Z</updated>
        <author><name>John Smith</name></author>
        <author><name>Jane Doe</name></author>
        <category term="cs.LG"/>
        <category term="cs.AI"/>
        <category term="cs.CV"/>
        <link title="pdf" href="http://arxiv.org/pdf/2304.01626v3.pdf"/>
      </entry>
      <entry>
        <id>http://arxiv.org/abs/2304.01627v1</id>
        <title>Deep Learning Architectures for Natural Language Processing</title>
        <summary>This research explores innovative transformer-based architectures for natural language processing tasks, including sentiment analysis, question answering, and machine translation.</summary>
        <published>2023-04-03T18:20:45Z</published>
        <updated>2023-04-03T18:20:45Z</updated>
        <author><name>Alice Johnson</name></author>
        <author><name>Bob Williams</name></author>
        <category term="cs.LG"/>
        <category term="cs.CL"/>
        <link title="pdf" href="http://arxiv.org/pdf/2304.01627v1.pdf"/>
      </entry>
      <entry>
        <id>http://arxiv.org/abs/2304.01628v2</id>
        <title>Quantum Computing Advances</title>
        <summary>A comprehensive review of recent advances in quantum computing algorithms, including Shor's algorithm implementations and quantum error correction techniques.</summary>
        <published>2023-04-04T09:15:30Z</published>
        <updated>2023-04-04T09:15:30Z</updated>
        <author><name>David Miller</name></author>
        <author><name>Sarah Chen</name></author>
        <category term="quant-ph"/>
        <category term="cs.ET"/>
        <link title="pdf" href="http://arxiv.org/pdf/2304.01628v2.pdf"/>
      </entry>
      <entry>
        <id>http://arxiv.org/abs/2304.01629v1</id>
        <title>Cybersecurity Threat Analysis using Machine Learning</title>
        <summary>This paper explores applications of machine learning for detecting and mitigating cybersecurity threats in networked systems, with emphasis on anomaly detection and behavior analysis.</summary>
        <published>2023-04-04T10:45:22Z</published>
        <updated>2023-04-04T10:45:22Z</updated>
        <author><name>Michael Chen</name></author>
        <author><name>Laura Rodriguez</name></author>
        <category term="cs.CR"/>
        <category term="cs.LG"/>
        <link title="pdf" href="http://arxiv.org/pdf/2304.01629v1.pdf"/>
      </entry>
      <entry>
        <id>http://arxiv.org/abs/2304.01630v1</id>
        <title>Social Network Analysis Techniques</title>
        <summary>A survey of current methodologies for social network analysis, including community detection, influence propagation, and sentiment analysis in online communities.</summary>
        <published>2023-04-04T14:20:11Z</published>
        <updated>2023-04-04T14:20:11Z</updated>
        <author><name>Emily Taylor</name></author>
        <category term="cs.SI"/>
        <category term="cs.CY"/>
        <link title="pdf" href="http://arxiv.org/pdf/2304.01630v1.pdf"/>
      </entry>
    </feed>`;
  }
  
  // Function to escape XML special characters
  function escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let papers: Paper[] = [];
      
      if (searchMode === 'preset' && selectedPreset) {
        // Use preset topic
        const presetInfo = TOPIC_PRESETS_DATA[selectedPreset];
        if (!presetInfo) {
          throw new Error('Invalid preset topic');
        }
        
        // Use preset search terms and categories
        const presetSearchTerms = presetInfo.searchTerms;
        const presetCategories = presetInfo.categories;
        
        // Build query using the preset information
        const categoryQuery = presetCategories.map(cat => `cat:${cat}`).join('+OR+');
        const searchQuery = `all:${encodeURIComponent(presetSearchTerms).replace(/%20/g, '+')}`;
        const queryString = `(${categoryQuery})+AND+(${searchQuery})`;
        
        try {
          const xml = await fetchArxivFeed(queryString, maxResults);
          papers = parseFeed(xml, selectedPreset, offlineMode);
          
          // Sort by relevance score
          papers.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        } catch (fetchErr) {
          console.error('Error fetching data:', fetchErr);
          setError('Failed to fetch data. Using offline mode with sample data.');
          
          // Ensure we fall back to offline mode
          setOfflineMode(true);
          const xml = getSampleData();
          papers = parseFeed(xml, selectedPreset, true);
        }
      } else {
        // Regular search using searchMode, searchField, searchTerms, categories
        const categories = selectedCategories.length > 0 ? selectedCategories : ['cs.LG'];
        const queryString = buildApiQuery(searchMode, searchField, searchTerms, categories);
        
        try {
          const xml = await fetchArxivFeed(queryString, maxResults);
          papers = parseFeed(xml, undefined, offlineMode);
          
          // For category searches, ensure papers match the selected categories
          if (searchMode === 'category' && categories.length > 0) {
            papers = papers.filter(paper => {
              // Check if the paper belongs to at least one of the selected categories
              return paper.categories.some(cat => categories.includes(cat));
            });
          }
          
          // Calculate relevance scores for all papers regardless of search mode
          papers.forEach(paper => {
            const title = paper.title.toLowerCase();
            const abstract = paper.abstract.toLowerCase();
            
            // If a paper already has a relevance score from a preset search, keep it
            if (paper.relevanceScore !== undefined && paper.relevanceTopic !== undefined) {
              return;
            }
            
            // Basic relevance mode depends on the search mode
            let relevanceTopic = "";
            let score = 0;
            
            if (searchMode === 'preset') {
              // Papers from preset search already have scores set above
              // This is just a fallback in case something went wrong
              relevanceTopic = selectedPreset || "Search Results";
              score = calculateFallbackRelevanceScore(title, abstract, relevanceTopic);
            } 
            else if (searchMode === 'category') {
              // For category-based searches
              relevanceTopic = "Category Search";
              
              // Check if paper matches any of the selected categories
              const matchesCategories = paper.categories.some(cat => 
                selectedCategories.includes(cat));
              
              if (matchesCategories) {
                // Higher base score for category matches
                score = 6;
                
                // If we also have search terms, check them
                const searchTermsForRelevance = searchTerms.trim().toLowerCase();
                if (searchTermsForRelevance) {
                  score = evaluateSearchTerms(title, abstract, searchTermsForRelevance);
                }
              } else {
                // Lower score for papers not matching selected categories
                score = 3;
              }
            }
            else {
              // Basic search mode using search terms
              relevanceTopic = "Search Terms";
              const searchTermsForRelevance = searchTerms.trim().toLowerCase();
              
              if (searchTermsForRelevance) {
                score = evaluateSearchTerms(title, abstract, searchTermsForRelevance);
              } else {
                // Without search terms, use content-based scoring
                score = calculateContentBasedScore(title, abstract);
              }
            }
            
            // Set the results
            paper.relevanceScore = Math.max(1, Math.min(10, Math.round(score)));
            paper.relevanceTopic = relevanceTopic;
          });
          
          // Ensure every paper has a non-zero score
          papers.forEach(paper => {
            if (!paper.relevanceScore || paper.relevanceScore < 1) {
              paper.relevanceScore = 1;
            }
          });
          
          // Sort by relevance score
          papers.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        } catch (fetchErr) {
          console.error('Error fetching data:', fetchErr);
          setError('Failed to fetch data. Using offline mode with sample data.');
          
          // Ensure we fall back to offline mode
          setOfflineMode(true);
          const xml = getSampleData();
          papers = parseFeed(xml, undefined, true);
        }
      }
      
      setResults(papers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Search Options
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search Mode Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Search Mode
          </label>
          <div className="flex flex-col space-y-3">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-primary h-4 w-4"
                name="searchMode"
                value="basic"
                checked={searchMode === 'basic'}
                onChange={() => handleSearchModeChange('basic')}
              />
              <span className="ml-2 text-gray-700 dark:text-gray-200">Basic Search</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-primary h-4 w-4"
                name="searchMode"
                value="category"
                checked={searchMode === 'category'}
                onChange={() => handleSearchModeChange('category')}
              />
              <span className="ml-2 text-gray-700 dark:text-gray-200">Search with Categories</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-primary h-4 w-4"
                name="searchMode"
                value="preset"
                checked={searchMode === 'preset'}
                onChange={() => handleSearchModeChange('preset')}
              />
              <span className="ml-2 text-gray-700 dark:text-gray-200">Use Specialized Topic Preset</span>
            </label>
          </div>
        </div>
        
        {/* Online/Offline Mode Toggle */}
        <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Offline Mode (Sample Data)
            </span>
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={offlineMode}
                onChange={() => setOfflineMode(!offlineMode)}
              />
              <div className={`block w-10 h-6 rounded-full ${offlineMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'} transition-colors`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${offlineMode ? 'transform translate-x-4' : ''}`}></div>
            </div>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {offlineMode 
              ? "Using sample data. No API calls will be made." 
              : "Will attempt to connect to arXiv API (may encounter CORS issues on GitHub Pages)"}
          </p>
        </div>
        
        {/* Search Field Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search In
          </label>
          <select
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as any)}
          >
            <option value="all">All Fields</option>
            <option value="ti">Title Only</option>
            <option value="au">Author Only</option>
            <option value="abs">Abstract Only</option>
          </select>
        </div>
        
        {/* Search Terms */}
        <div>
          <label htmlFor="searchTerms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Terms
            {searchMode === 'preset' && (
              <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                (Disabled in preset mode - using predefined terms)
              </span>
            )}
          </label>
          <input
            type="text"
            id="searchTerms"
            className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              searchMode === 'preset' ? 'bg-gray-100 dark:bg-gray-800 opacity-60' : ''
            }`}
            placeholder={searchMode === 'preset' ? 'Using preset search terms...' : 'e.g., Artificial Intelligence, neural networks'}
            value={searchTerms}
            onChange={(e) => setSearchTerms(e.target.value)}
            disabled={searchMode === 'preset'}
          />
        </div>
        
        {/* Category Selection */}
        {searchMode === 'category' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categories
            </label>
            <div className="mt-2 max-h-60 overflow-y-auto p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
              {COMMON_CATEGORIES.map((category) => (
                <div key={category.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={category.id}
                    className="form-checkbox text-primary h-4 w-4 rounded-sm border-gray-300 focus:ring-primary"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                  />
                  <label htmlFor={category.id} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {category.name} ({category.id})
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {selectedCategories.length === 0 
                ? 'No categories selected. Will default to Machine Learning (cs.LG).' 
                : `Selected: ${selectedCategories.join(', ')}`}
            </div>
          </div>
        )}
        
        {/* Preset Selection */}
        {searchMode === 'preset' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Specialized Topic Preset
            </label>
            <select
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
            >
              <option value="">Select a preset...</option>
              {TOPIC_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} - {preset.description}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Max Results */}
        <div>
          <label htmlFor="maxResults" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Maximum Results
          </label>
          <input
            type="number"
            id="maxResults"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            min="1"
            max="100"
            value={maxResults}
            onChange={(e) => setMaxResults(parseInt(e.target.value))}
          />
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-primary to-secondary text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150 shadow-md flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search Papers
        </button>
      </form>
      <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-300">GitHub Pages Limitation</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              </br>
                The hosted version is running mode with limited sample data (maximum 50 results), and there is a possibility of the offline mode (using mock data) activating automatically.
                For full functionality including unlimited results and direct arXiv access, please run this application locally.
                
              </p>
            </div>
    </div>
  );
} 
