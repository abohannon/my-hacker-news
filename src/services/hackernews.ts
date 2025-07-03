import type { Story } from '../App';

export interface HackerNewsResponse {
  stories: Story[];
  cached: boolean;
  lastUpdated: string;
}

export interface HackerNewsError {
  error: string;
  message: string;
}

// This will be set to your actual Cloud Function URL after deployment
const CLOUD_FUNCTION_URL = import.meta.env.VITE_CLOUD_FUNCTION_URL || 'https://YOUR_FUNCTION_URL_HERE';

export class HackerNewsService {
  private static instance: HackerNewsService;
  private cache: HackerNewsResponse | null = null;

  private constructor() {}

  static getInstance(): HackerNewsService {
    if (!HackerNewsService.instance) {
      HackerNewsService.instance = new HackerNewsService();
    }
    return HackerNewsService.instance;
  }

  /**
   * Fetch stories from the Cloud Function
   */
  async fetchStories(): Promise<HackerNewsResponse> {
    try {
      const response = await fetch(CLOUD_FUNCTION_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: HackerNewsResponse = await response.json();
      
      // Update local cache
      this.cache = data;
      
      return data;
    } catch (error) {
      console.error('Error fetching stories:', error);
      
      // Return cached data if available
      if (this.cache) {
        console.log('Returning cached data due to error');
        return this.cache;
      }
      
      throw error;
    }
  }

  /**
   * Get cached stories if available
   */
  getCachedStories(): HackerNewsResponse | null {
    return this.cache;
  }

  /**
   * Clear local cache
   */
  clearCache(): void {
    this.cache = null;
  }
}