export interface Story {
  id: string;
  title: string;
  text: string | null;
  url: string | null;
  score: string | null;
  parent: string | null;
  ranking: string | null;
  descendants: string | null;
  timestamp: string;
}

export interface PaginationMeta {
  limit: number;
  offset: number;
  count: number;
  hasMore: boolean;
}

export interface HackerNewsResponse {
  stories: Story[];
  cached: boolean;
  lastUpdated: string;
  pagination?: PaginationMeta;
}

export interface HackerNewsError {
  error: string;
  message: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  sortBy?: string;
}
