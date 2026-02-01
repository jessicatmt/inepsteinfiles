/**
 * Document ranking system for prioritizing "juicy" evidence
 * Sorts documents by relevance and importance
 */

import { DocumentScreenshot } from '@/types';

export interface RankedDocument {
  filename: string;
  classification: string;
  source_url: string;
  source_attribution?: string;
  sha256?: string;
  verification_status?: string;
  match_count?: number;
  matches?: Array<{
    page?: number;
    matched_variant?: string;
    snippet?: string;
  }>;
  screenshots?: DocumentScreenshot[];
  rankScore?: number;
  rankTier?: number;
}

/**
 * Document classification tiers for ranking
 * Higher tier = more interesting/relevant
 */
const CLASSIFICATION_TIERS: Record<string, number> = {
  // Tier 1 - Direct Connection (Most "Juicy") - Score 100-90
  'Flight Logs': 100,
  'Flight Manifest': 100,
  'Little Black Book': 95,
  'Black Book': 95,
  'Contact Book': 95,
  'Handwritten Notes': 92,
  'Personal Calendar': 90,
  'Appointment Book': 90,
  'Text Messages': 90,
  'Direct Communications': 90,
  'Island Records': 90,
  
  // Tier 2 - Named Directly - Score 80-60
  'Email': 80,
  'Emails': 80,
  'Deposition': 75,
  'Depositions': 75,
  'Testimony': 75,
  'Contact Information': 70,
  'Financial Records': 65,
  'Bank Statement': 65,
  'Financial Document': 65,
  'Phone Records': 60,
  
  // Tier 3 - Mentioned - Score 50-20
  'News Article': 50,
  'News Articles': 50,
  'Article': 45,
  'Court Filing': 40,
  'Legal Document': 35,
  'Court Document': 35,
  'Third-Party Testimony': 30,
  'Reference': 25,
  'Mention': 20,
  
  // Default for unclassified
  'Document': 10,
  'Unknown': 5,
};

/**
 * Keywords that boost document ranking when found in snippets
 */
const BOOST_KEYWORDS = [
  'flight',
  'flew',
  'island',
  'massage',
  'met with',
  'visited',
  'guest',
  'pilot',
  'passenger',
  'lolita express',
  'little st james',
  'new mexico',
  'palm beach',
  'manhattan',
  'residence',
  'private',
];

/**
 * Calculate ranking score for a document
 */
function calculateRankScore(doc: RankedDocument): number {
  // Base score from classification
  let score = CLASSIFICATION_TIERS[doc.classification || 'Unknown'] || 10;
  
  // Boost for multiple matches
  if (doc.match_count && doc.match_count > 1) {
    score += Math.min(doc.match_count * 2, 10); // Max 10 point boost
  }
  
  // Boost for keyword presence in snippets
  if (doc.matches && doc.matches.length > 0) {
    const allSnippets = doc.matches
      .map(m => (m.snippet || '').toLowerCase())
      .join(' ');
    
    const keywordBoost = BOOST_KEYWORDS.reduce((boost, keyword) => {
      if (allSnippets.includes(keyword)) {
        return boost + 3; // 3 points per keyword
      }
      return boost;
    }, 0);
    
    score += Math.min(keywordBoost, 15); // Max 15 point keyword boost
  }
  
  // Slight penalty for unverified sources
  if (doc.verification_status === 'UNVERIFIED') {
    score *= 0.95;
  }
  
  return Math.round(score);
}

/**
 * Get tier number (1-3) for a document classification
 */
function getTier(classification: string): number {
  const score = CLASSIFICATION_TIERS[classification || 'Unknown'] || 10;
  if (score >= 90) return 1;
  if (score >= 60) return 2;
  return 3;
}

/**
 * Rank and sort documents by relevance
 * @param documents Array of documents to rank
 * @returns Sorted array with most relevant first
 */
export function rankDocuments(documents: RankedDocument[]): RankedDocument[] {
  if (!documents || documents.length === 0) {
    return [];
  }
  
  // Calculate scores and tiers
  const rankedDocs = documents.map(doc => ({
    ...doc,
    rankScore: calculateRankScore(doc),
    rankTier: getTier(doc.classification || 'Unknown'),
  }));
  
  // Sort by score (highest first)
  rankedDocs.sort((a, b) => {
    // First by score
    if (a.rankScore !== b.rankScore) {
      return (b.rankScore || 0) - (a.rankScore || 0);
    }
    // Then by match count
    if (a.match_count !== b.match_count) {
      return (b.match_count || 0) - (a.match_count || 0);
    }
    // Finally alphabetically by filename
    return (a.filename || '').localeCompare(b.filename || '');
  });
  
  return rankedDocs;
}

/**
 * Get a human-readable tier label
 */
export function getTierLabel(tier: number): string {
  switch (tier) {
    case 1:
      return 'Direct Connection';
    case 2:
      return 'Named Directly';
    case 3:
      return 'Mentioned';
    default:
      return 'Reference';
  }
}

/**
 * Get display icon for document classification
 */
export function getClassificationIcon(classification: string): string {
  const lowerClass = (classification || '').toLowerCase();
  
  if (lowerClass.includes('flight')) return '✈️';
  if (lowerClass.includes('black book') || lowerClass.includes('contact')) return '📖';
  if (lowerClass.includes('email')) return '📧';
  if (lowerClass.includes('deposition') || lowerClass.includes('testimony')) return '⚖️';
  if (lowerClass.includes('financial') || lowerClass.includes('bank')) return '💰';
  if (lowerClass.includes('text') || lowerClass.includes('message')) return '💬';
  if (lowerClass.includes('calendar') || lowerClass.includes('appointment')) return '📅';
  if (lowerClass.includes('handwritten') || lowerClass.includes('note')) return '✍️';
  if (lowerClass.includes('news') || lowerClass.includes('article')) return '📰';
  if (lowerClass.includes('court') || lowerClass.includes('legal')) return '📋';
  
  return '📄';
}