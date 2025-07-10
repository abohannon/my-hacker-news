import type { HackerNewsResponse, PaginationParams } from '../types';

const CLOUD_FUNCTION_URL = import.meta.env.VITE_CLOUD_FUNCTION_URL || 'https://YOUR_FUNCTION_URL_HERE';

export class HackerNewsService {
  private static instance: HackerNewsService;
  private cache: Map<string, HackerNewsResponse> = new Map();

  private constructor() {}

  static getInstance(): HackerNewsService {
    if (!HackerNewsService.instance) {
      HackerNewsService.instance = new HackerNewsService();
    }
    return HackerNewsService.instance;
  }

  private buildCacheKey(params: PaginationParams): string {
    return `stories_${params.limit || 200}_${params.offset || 0}`;
  }

  private buildUrl(params: PaginationParams): string {
    const url = new URL(CLOUD_FUNCTION_URL);
    if (params.limit) url.searchParams.set('limit', params.limit.toString());
    if (params.offset) url.searchParams.set('offset', params.offset.toString());
    return url.toString();
  }

  async fetchStories(params: PaginationParams = {}): Promise<HackerNewsResponse> {
    const cacheKey = this.buildCacheKey(params);

    try {
      const response = await fetch(this.buildUrl(params), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: HackerNewsResponse = await response.json();

      // Update cache
      this.cache.set(cacheKey, data);

      return data;
    } catch (error) {
      console.error('Error fetching stories:', error);

      // Return cached data if available
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        console.log('Returning cached data due to error');
        return cachedData;
      }

      throw error;
    }
  }

  getCachedStories(params: PaginationParams = {}): HackerNewsResponse | null {
    const cacheKey = this.buildCacheKey(params);
    return this.cache.get(cacheKey) || null;
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Helper method to check if we have cached data for a specific page
  hasCachedPage(params: PaginationParams): boolean {
    const cacheKey = this.buildCacheKey(params);
    return this.cache.has(cacheKey);
  }
}
