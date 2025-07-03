import {
  Container,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import StoryCard from "../components/StoryCard";
import { useState, useMemo } from "react";
import { useHackerNews } from "../hooks/useHackerNews";

export default function Home() {
  const [sort, setSort] = useState("latest");

  const {
    stories,
    isLoading,
    error,
    isError,
    isFetching,
    lastUpdated,
    isCached,
    refetch,
  } = useHackerNews();

  const sortedStories = useMemo(() => {
    const storiesToSort = [...stories];
    storiesToSort.sort((a, b) => {
      switch (sort) {
        case "score":
          return (parseInt(b.score || "0") - parseInt(a.score || "0"));
        case "descendants":
          return (
            (parseInt(b.descendants || "0") - parseInt(a.descendants || "0"))
          );
        case "latest":
        case "oldest": {

          const aTime = new Date(a.timestamp).getTime();
          const bTime = new Date(b.timestamp).getTime();

            // For invalid dates, fallback to string comparison
          if (isNaN(aTime) || isNaN(bTime)) {
            return sort === "latest"
              ? b.timestamp.localeCompare(a.timestamp)
              : a.timestamp.localeCompare(b.timestamp);
          }

          return sort === "latest"
            ? bTime - aTime  // Latest first
            : aTime - bTime; // Oldest first
        }
        default:
          return 0;
      }
    });
    return storiesToSort;
  }, [stories, sort]);

  const loading = isLoading || isFetching;

  return (
    <Container sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', marginBottom: 2, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          onClick={() => refetch()}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
          size="small"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>

        {lastUpdated && (
          <Chip
            label={`Updated: ${new Date(lastUpdated).toLocaleString()}`}
            size="small"
            color={isCached ? 'warning' : 'success'}
            variant="outlined"
          />
        )}
      </Box>

      {isError && error && (
        <Alert severity="warning" sx={{ marginBottom: 2 }}>
          {error.message} - Showing cached or fallback data
        </Alert>
      )}
      <Box sx={{ minWidth: 120, marginBottom: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="sort-by-label">Sort By</InputLabel>
          <Select
            labelId="sort-by-label"
            id="sort-by-select"
            value={sort}
            label="Sort By"
            onChange={(e) => setSort(e.target.value)}
          >
            <MenuItem value="score">Score</MenuItem>
            <MenuItem value="descendants">Number of Comments</MenuItem>
            <MenuItem value="latest">Latest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Grid container spacing={3}>
        {sortedStories.map((story) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={story.id}>
            <StoryCard story={story} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
