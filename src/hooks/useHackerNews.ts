import { useQuery, useQueries } from '@tanstack/react-query';
import { HackerNewsService } from '../services/hackernews';
import type { Story, HackerNewsResponse, PaginationParams } from '../types';
import stories from '../hn_stories.json';
import { useMemo } from 'react';

export const HACKER_NEWS_QUERY_KEY = ['hacker-news-stories'] as const;
export const PAGINATED_HACKER_NEWS_QUERY_KEY = ['paginated-hacker-news-stories'] as const;

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

interface UsePaginatedHackerNewsResult {
  stories: Story[];
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  isFetching: boolean;
  lastUpdated: string | null;
  isCached: boolean;
  refetch: () => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
    isLoadingMore: boolean;
  };
}

interface UsePaginatedHackerNewsParams {
  page: number;
  itemsPerPage: number;
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

export function usePaginatedHackerNews({ page, itemsPerPage }: UsePaginatedHackerNewsParams): UsePaginatedHackerNewsResult {
  const hackerNewsService = HackerNewsService.getInstance();

  // Calculate what data we need to fetch
  const currentOffset = (page - 1) * itemsPerPage;
  const isFirstPage = page === 1;

  // For page 1, fetch extra items to cover page 2 as well
  const currentPageParams: PaginationParams = {
    limit: isFirstPage ? itemsPerPage * 2 : itemsPerPage,
    offset: currentOffset,
  };

  // Prefetch next page (if not first page)
  const nextPageParams: PaginationParams = {
    limit: itemsPerPage,
    offset: currentOffset + itemsPerPage,
  };

  const queryConfigs = [
    {
      queryKey: [...PAGINATED_HACKER_NEWS_QUERY_KEY, 'current', page, itemsPerPage],
      queryFn: async (): Promise<HackerNewsResponse> => {
        try {
          return await hackerNewsService.fetchStories(currentPageParams);
        } catch {
          const cachedData = hackerNewsService.getCachedStories(currentPageParams);
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
            pagination: {
              limit: currentPageParams.limit || itemsPerPage,
              offset: currentPageParams.offset || 0,
              count: stories.length,
              hasMore: false,
            },
          };
        }
      },
      enabled: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  ];

  // Add prefetch query for next page (only if not first page)
  if (!isFirstPage) {
    queryConfigs.push({
      queryKey: [...PAGINATED_HACKER_NEWS_QUERY_KEY, 'prefetch', page + 1, itemsPerPage],
      queryFn: async (): Promise<HackerNewsResponse> => {
        try {
          return await hackerNewsService.fetchStories(nextPageParams);
        } catch {
          const cachedData = hackerNewsService.getCachedStories(nextPageParams);
          if (cachedData) {
            return cachedData;
          }
          throw new Error('Failed to prefetch next page');
        }
      },
      enabled: true,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    });
  }

  const results = useQueries({
    queries: queryConfigs,
  });

  const currentPageResult = results[0];
  const prefetchResult = results[1];

  // Extract stories for current page
  const currentStories = useMemo(() => {
    const allStories = currentPageResult.data?.stories || [];

    if (isFirstPage) {
      // For first page, we fetched 2 pages worth, so slice to get just the first page
      return allStories.slice(0, itemsPerPage);
    }

    return allStories;
  }, [currentPageResult.data?.stories, isFirstPage, itemsPerPage]);

  // Calculate pagination info
  const hasMore = currentPageResult.data?.pagination?.hasMore || false;
  const totalPages = hasMore ? page + 1 : page; // We don't know total until we hit the end

  const refetch = () => {
    currentPageResult.refetch();
    if (prefetchResult) {
      prefetchResult.refetch();
    }
  };

  return {
    stories: currentStories,
    isLoading: currentPageResult.isLoading,
    error: currentPageResult.error as Error | null,
    isError: currentPageResult.isError,
    isFetching: currentPageResult.isFetching || (prefetchResult?.isFetching || false),
    lastUpdated: currentPageResult.data?.lastUpdated || null,
    isCached: currentPageResult.data?.cached || false,
    refetch,
    pagination: {
      currentPage: page,
      totalPages,
      hasMore,
      isLoadingMore: prefetchResult?.isFetching || false,
    },
  };
}
