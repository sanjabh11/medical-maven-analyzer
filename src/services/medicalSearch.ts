import axios from 'axios';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
}

class MedicalSearchService {
  private readonly GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  private readonly GOOGLE_CX = process.env.GOOGLE_SEARCH_CX;
  private readonly PUBMED_API_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

  async searchMedicalFindings(query: string): Promise<SearchResult[]> {
    try {
      const [googleResults, pubmedResults] = await Promise.all([
        this.searchGoogle(query),
        this.searchPubMed(query)
      ]);

      return [...googleResults, ...pubmedResults];
    } catch (error) {
      console.error('Medical search error:', error);
      return [];
    }
  }

  private async searchGoogle(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: this.GOOGLE_API_KEY,
          cx: this.GOOGLE_CX,
          q: `medical ${query}`,
          num: 5
        }
      });

      return response.data.items.map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        source: 'Google'
      }));
    } catch (error) {
      console.error('Google search error:', error);
      return [];
    }
  }

  private async searchPubMed(query: string): Promise<SearchResult[]> {
    try {
      // First, search for relevant PubMed IDs
      const searchResponse = await axios.get(`${this.PUBMED_API_URL}/esearch.fcgi`, {
        params: {
          db: 'pubmed',
          term: query,
          retmax: 5,
          format: 'json'
        }
      });

      const ids = searchResponse.data.esearchresult.idlist;

      // Then, fetch details for each ID
      const summaryResponse = await axios.get(`${this.PUBMED_API_URL}/esummary.fcgi`, {
        params: {
          db: 'pubmed',
          id: ids.join(','),
          format: 'json'
        }
      });

      return Object.values(summaryResponse.data.result).map((item: any) => ({
        title: item.title,
        link: `https://pubmed.ncbi.nlm.nih.gov/${item.uid}`,
        snippet: item.description || '',
        source: 'PubMed'
      }));
    } catch (error) {
      console.error('PubMed search error:', error);
      return [];
    }
  }

  async verifyMedicalClaim(claim: string): Promise<{
    verified: boolean;
    sources: SearchResult[];
    confidence: number;
  }> {
    try {
      const searchResults = await this.searchMedicalFindings(claim);
      
      // Simple verification logic - can be enhanced with NLP
      const confidence = searchResults.length > 0 ? 
        searchResults.length / 10 : 0; // Basic confidence score

      return {
        verified: confidence > 0.3,
        sources: searchResults,
        confidence
      };
    } catch (error) {
      console.error('Claim verification error:', error);
      return {
        verified: false,
        sources: [],
        confidence: 0
      };
    }
  }
}

export const medicalSearchService = new MedicalSearchService(); 