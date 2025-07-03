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

export interface HackerNewsResponse {
  stories: Story[];
  cached: boolean;
  lastUpdated: string;
}

export interface HackerNewsError {
  error: string;
  message: string;
}
