import { useQuery } from '@tanstack/react-query';
import { HackerNewsService, type HackerNewsResponse } from '../services/hackernews';
import type { Story } from '../App';
import stories from '../hn_stories.json';

export const HACKER_NEWS_QUERY_KEY = ['hacker-news-stories'] as const;

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

export function useHackerNews(): UseHackerNewsResult {
  const hackerNewsService = HackerNewsService.getInstance();

  const {
    data,
    isLoading,
    error,
    isError,
    isFetching,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: HACKER_NEWS_QUERY_KEY,
    queryFn: async (): Promise<HackerNewsResponse> => {
      try {
        return await hackerNewsService.fetchStories();
      } catch {
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
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
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
