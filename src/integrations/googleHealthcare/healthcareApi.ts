import { GoogleAuth } from 'google-auth-library';
import NodeCache from 'node-cache';

interface HealthcareConfig {
  projectId: string;
  location: string;
  datasetId: string;
  fhirStoreId: string;
  dicomStoreId: string;
}

interface CacheConfig {
  stdTTL: number;
  checkperiod: number;
}

const config: HealthcareConfig = {
  projectId: 'musically-438108',
  location: 'us-central1',
  datasetId: 'medical_dataset',
  fhirStoreId: 'symptoms_store',
  dicomStoreId: 'radiology_store'
};

const cacheConfig: CacheConfig = {
  stdTTL: 3600, // 1 hour cache
  checkperiod: 600 // Check every 10 minutes
};

class HealthcareAPI {
  private auth: GoogleAuth;
  private baseUrl: string;
  private dicomBaseUrl: string;
  private cache: NodeCache;

  constructor() {
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-healthcare']
    });

    this.baseUrl = `https://healthcare.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/datasets/${config.datasetId}/fhirStores/${config.fhirStoreId}/fhir`;
    this.dicomBaseUrl = `https://healthcare.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/datasets/${config.datasetId}/dicomStores/${config.dicomStoreId}/dicomWeb`;
    
    this.cache = new NodeCache(cacheConfig);
  }

  private getCacheKey(method: string, params: string): string {
    return `${method}_${params}`;
  }

  async getAuthToken(): Promise<string> {
    try {
      const cacheKey = 'auth_token';
      const cachedToken = this.cache.get<string>(cacheKey);
      
      if (cachedToken) {
        return cachedToken;
      }

      const client = await this.auth.getClient();
      const token = await client.getAccessToken();
      
      if (token.token) {
        this.cache.set(cacheKey, token.token, 3300); // Cache for 55 minutes (tokens usually expire in 1 hour)
        return token.token;
      }
      
      throw new Error('Failed to get auth token');
    } catch (error) {
      console.error('Auth token error:', error);
      throw error;
    }
  }

  async searchConditions(symptoms: string): Promise<any[]> {
    try {
      const cacheKey = this.getCacheKey('searchConditions', symptoms);
      const cachedResult = this.cache.get<any[]>(cacheKey);

      if (cachedResult) {
        return cachedResult;
      }

      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.baseUrl}/Condition/$match`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resourceType: 'Parameters',
          parameter: [{
            name: 'resource',
            resource: {
              resourceType: 'Condition',
              code: {
                text: symptoms
              }
            }
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Healthcare API error: ${response.statusText}`);
      }

      const data = await response.json();
      const results = data.entry || [];
      
      this.cache.set(cacheKey, results);
      return results;

    } catch (error) {
      console.error('Healthcare API search error:', error);
      return [];
    }
  }

  async uploadDicomImage(imageData: ArrayBuffer, studyUid?: string): Promise<any> {
    try {
      const token = await this.getAuthToken();
      
      const endpoint = studyUid 
        ? `${this.dicomBaseUrl}/studies/${studyUid}`
        : `${this.dicomBaseUrl}/studies`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/dicom',
          'Accept': 'application/dicom+json'
        },
        body: imageData
      });

      if (!response.ok) {
        throw new Error(`DICOM upload error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('DICOM upload error:', error);
      throw error;
    }
  }

  async getDicomStudy(studyUid: string): Promise<any> {
    try {
      const cacheKey = this.getCacheKey('getDicomStudy', studyUid);
      const cachedResult = this.cache.get<any>(cacheKey);

      if (cachedResult) {
        return cachedResult;
      }

      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.dicomBaseUrl}/studies/${studyUid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/dicom+json'
        }
      });

      if (!response.ok) {
        throw new Error(`DICOM study retrieval error: ${response.statusText}`);
      }

      const result = await response.json();
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('DICOM study retrieval error:', error);
      throw error;
    }
  }

  async getDicomImage(studyUid: string, seriesUid: string, instanceUid: string): Promise<ArrayBuffer> {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(
        `${this.dicomBaseUrl}/studies/${studyUid}/series/${seriesUid}/instances/${instanceUid}/frames/1`, 
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/octet-stream'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`DICOM image retrieval error: ${response.statusText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('DICOM image retrieval error:', error);
      throw error;
    }
  }

  async getRelevantMedicalInfo(symptoms: string): Promise<any[]> {
    try {
      const cacheKey = this.getCacheKey('getRelevantMedicalInfo', symptoms);
      const cachedResult = this.cache.get<any[]>(cacheKey);

      if (cachedResult) {
        return cachedResult;
      }

      const conditions = await this.searchConditions(symptoms);
      
      const results = conditions.map(entry => ({
        condition: entry.resource.code?.text || 'Unknown condition',
        severity: entry.resource.severity?.text || 'Unknown severity',
        details: entry.resource.note?.[0]?.text || '',
        lastUpdated: entry.resource.meta?.lastUpdated || new Date().toISOString()
      }));

      this.cache.set(cacheKey, results);
      return results;

    } catch (error) {
      console.error('Error fetching medical info:', error);
      return [];
    }
  }

  clearCache(): void {
    this.cache.flushAll();
  }
}

export const healthcareAPI = new HealthcareAPI(); 