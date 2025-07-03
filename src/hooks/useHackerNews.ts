import { useQuery, useQueryClient } from '@tanstack/react-query';
import { HackerNewsService, type HackerNewsResponse } from '../services/hackernews';
import type { Story } from '../App';
import stories from '../hn_stories.json';

export const HACKER_NEWS_QUERY_KEY = ['hacker-news-stories'] as const;

interface UseHackerNewsOptions {
  useCloudFunction: boolean;
}

interface UseHackerNewsResult {
  stories: Story[];
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  isFetching: boolean;
  lastUpdated: string | null;
  isCached: boolean;
  refetch: () => void;
}

export function useHackerNews({ useCloudFunction }: UseHackerNewsOptions): UseHackerNewsResult {
  const hackerNewsService = HackerNewsService.getInstance();

  const {
    data,
    isLoading,
    error,
    isError,
    isFetching,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: [...HACKER_NEWS_QUERY_KEY, useCloudFunction],
    queryFn: async (): Promise<HackerNewsResponse> => {
      if (!useCloudFunction) {
        // Return static data in the same format as the API
        return {
          stories: stories as Story[],
          cached: false,
          lastUpdated: new Date().toISOString(),
        };
      }
      
      try {
        return await hackerNewsService.fetchStories();
      } catch {
        // Try to use cached data from service on error
        const cachedData = hackerNewsService.getCachedStories();
        if (cachedData) {
          return {
            ...cachedData,
            cached: true,
          };
        }
        
        // Final fallback to static data
        return {
          stories: stories as Story[],
          cached: false,
          lastUpdated: new Date().toISOString(),
        };
      }
    },
    enabled: true, // Always enabled, but behavior changes based on useCloudFunction
    staleTime: useCloudFunction ? 5 * 60 * 1000 : Infinity, // 5 minutes for cloud function, never stale for static
    gcTime: useCloudFunction ? 30 * 60 * 1000 : Infinity, // 30 minutes for cloud function
    retry: useCloudFunction ? 2 : false, // Retry only for cloud function calls
    refetchOnWindowFocus: false,
  });

  const refetch = () => {
    queryRefetch();
  };


  return {
    stories: data?.stories || [],
    isLoading,
    error: error as Error | null,
    isError,
    isFetching,
    lastUpdated: data?.lastUpdated || null,
    isCached: data?.cached || false,
    refetch,
  };
}

// Helper hook to manage cache clearing when switching data sources
export function useHackerNewsCache() {
  const queryClient = useQueryClient();
  
  const clearCache = () => {
    queryClient.removeQueries({ queryKey: HACKER_NEWS_QUERY_KEY });
  };
  
  const invalidateCache = () => {
    queryClient.invalidateQueries({ queryKey: HACKER_NEWS_QUERY_KEY });
  };
  
  return {
    clearCache,
    invalidateCache,
  };
}