import { QdrantClient } from '@qdrant/js-client-rest';
import { QdrantService, SearchResult } from '../types.js';
import fetch from 'node-fetch';

export class DefaultQdrantService implements QdrantService {
  private url: string;
  private apiKey?: string;

  constructor(public client: QdrantClient, url: string, apiKey?: string) {
    this.url = url;
    this.apiKey = apiKey;
  }

  async listCollections(): Promise<string[]> {
    try {
      console.log('Attempting to connect to Qdrant server using direct fetch...');
      
      // Use direct fetch instead of the client
      const collectionsUrl = `${this.url}/collections`;
      console.log(`Fetching from: ${collectionsUrl}`);
      
      const response = await fetch(collectionsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'api-key': this.apiKey } : {})
        },
        // @ts-ignore - node-fetch supports timeout
        timeout: 5000 // 5 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json() as { 
        result: { 
          collections: Array<{ name: string }> 
        } 
      };
      console.log('Successfully retrieved collections:', data);
      
      return data.result.collections.map(c => c.name);
    } catch (error) {
      console.error('Error in listCollections:', error);
      if (error instanceof Error) {
        console.error(`${error.name}: ${error.message}`);
        console.error('Stack:', error.stack);
      }
      throw error;
    }
  }

  async createCollection(name: string, vectorSize: number): Promise<void> {
    try {
      console.log('Attempting to create Qdrant collection using direct fetch...');
      
      // Use direct fetch instead of the client
      const createUrl = `${this.url}/collections/${name}`;
      console.log(`Fetching from: ${createUrl}`);
      
      const response = await fetch(createUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'api-key': this.apiKey } : {})
        },
        // @ts-ignore - node-fetch supports timeout
        timeout: 5000, // 5 second timeout
        body: JSON.stringify({
          vectors: {
            size: vectorSize,
            distance: 'Cosine',
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Successfully created collection:', data);
    } catch (error) {
      console.error('Error in createCollection:', error);
      if (error instanceof Error) {
        console.error(`${error.name}: ${error.message}`);
        console.error('Stack:', error.stack);
      }
      throw error;
    }
  }

  async addDocuments(
    collection: string,
    documents: { id: string; vector: number[]; payload: Record<string, any> }[]
  ): Promise<void> {
    try {
      console.log('Attempting to add documents to Qdrant collection using direct fetch...');
      
      // Use direct fetch instead of the client
      const upsertUrl = `${this.url}/collections/${collection}/points`;
      console.log(`Fetching from: ${upsertUrl}`);
      
      const points = documents.map(doc => ({
        id: doc.id,
        // Ensure vector is a plain number[] array for proper JSON serialization
        vector: Array.from(doc.vector),
        payload: doc.payload,
      }));
      
      const response = await fetch(upsertUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'api-key': this.apiKey } : {})
        },
        // @ts-ignore - node-fetch supports timeout
        timeout: 10000, // 10 second timeout for potentially larger uploads
        body: JSON.stringify({
          points
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Successfully added documents:', data);
    } catch (error) {
      console.error('Error in addDocuments:', error);
      if (error instanceof Error) {
        console.error(`${error.name}: ${error.message}`);
        console.error('Stack:', error.stack);
      }
      throw error;
    }
  }

  async deleteCollection(name: string): Promise<void> {
    try {
      console.log('Attempting to delete Qdrant collection using direct fetch...');
      
      // Use direct fetch instead of the client
      const deleteUrl = `${this.url}/collections/${name}`;
      console.log(`Fetching from: ${deleteUrl}`);
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'api-key': this.apiKey } : {})
        },
        // @ts-ignore - node-fetch supports timeout
        timeout: 5000 // 5 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Successfully deleted collection:', data);
    } catch (error) {
      console.error('Error in deleteCollection:', error);
      if (error instanceof Error) {
        console.error(`${error.name}: ${error.message}`);
        console.error('Stack:', error.stack);
      }
      throw error;
    }
  }

  async search(
    collection: string,
    vector: number[],
    limit: number = 10
  ): Promise<SearchResult[]> {
    try {
      console.log('Attempting to search Qdrant collection using direct fetch...');
      
      // Use direct fetch instead of the client
      const searchUrl = `${this.url}/collections/${collection}/points/search`;
      console.log(`Fetching from: ${searchUrl}`);
      
      const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'api-key': this.apiKey } : {})
        },
        // @ts-ignore - node-fetch supports timeout
        timeout: 5000, // 5 second timeout
        body: JSON.stringify({
          // Ensure vector is a plain number[] array for proper JSON serialization
          vector: Array.from(vector),
          limit,
          with_payload: true,
          with_vector: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json() as { 
        result: Array<{
          id: string;
          score: number;
          payload: Record<string, any>;
          vector?: number[];
        }> 
      };
      
      console.log('Successfully retrieved search results:', data);
      
      return data.result.map(result => {
        const searchResult: SearchResult = {
          id: result.id,
          score: result.score,
          payload: result.payload,
        };
        
        // Only include vector if it's a number array
        if (Array.isArray(result.vector) && result.vector.every(v => typeof v === 'number')) {
          searchResult.vector = result.vector;
        }
        
        return searchResult;
      });
    } catch (error) {
      console.error('Error in search:', error);
      if (error instanceof Error) {
        console.error(`${error.name}: ${error.message}`);
        console.error('Stack:', error.stack);
      }
      throw error;
    }
  }
}

export function createQdrantService(url: string, apiKey?: string): QdrantService {
  // Parse the URL to handle port correctly
  const urlObj = new URL(url);
  
  // Create client with explicit host and port if provided
  const clientConfig: any = {
    host: urlObj.hostname,
    apiKey,
    checkCompatibility: false,
    https: urlObj.protocol === 'https:',
  };
  
  // Only set port if it's explicitly in the URL
  if (urlObj.port) {
    clientConfig.port = parseInt(urlObj.port, 10);
  }
  
  // Add path if present
  if (urlObj.pathname !== '/' && urlObj.pathname !== '') {
    clientConfig.prefix = urlObj.pathname;
  }
  
  console.log('Creating Qdrant client with config:', clientConfig);
  const client = new QdrantClient(clientConfig);

  return new DefaultQdrantService(client, url, apiKey);
}
