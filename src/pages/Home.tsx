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
  Pagination,
  Typography,
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import StoryCard from "../components/StoryCard";
import { useState, useMemo } from "react";
import { usePaginatedHackerNews } from "../hooks/useHackerNews";

const ITEMS_PER_PAGE = 100;

export default function Home() {
  const [sort, setSort] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    stories,
    isLoading,
    error,
    isError,
    isFetching,
    lastUpdated,
    isCached,
    refetch,
    pagination,
  } = usePaginatedHackerNews({
    page: currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  // Client-side sorting for the current page
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

  // Reset to page 1 when sort changes
  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + sortedStories.length;

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

        {pagination.isLoadingMore && (
          <Chip
            label="Prefetching..."
            size="small"
            color="info"
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
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <MenuItem value="score">Score</MenuItem>
            <MenuItem value="descendants">Number of Comments</MenuItem>
            <MenuItem value="latest">Latest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Pagination Info */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {startIndex + 1}-{endIndex} (Page {pagination.currentPage})
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {pagination.hasMore ? `${pagination.totalPages}+ pages` : `${pagination.totalPages} pages total`}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {sortedStories.map((story) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={story.id}>
            <StoryCard story={story} />
          </Grid>
        ))}
      </Grid>

      {/* Pagination Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination
          count={pagination.hasMore ? pagination.currentPage + 1 : pagination.currentPage}
          page={pagination.currentPage}
          onChange={handlePageChange}
          color="primary"
          size="large"
          showFirstButton
          showLastButton={!pagination.hasMore}
          disabled={loading}
        />
      </Box>

      {/* Loading indicator for next page */}
      {pagination.hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            More stories available
          </Typography>
        </Box>
      )}
    </Container>
  );
}
