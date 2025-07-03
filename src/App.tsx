import {
  Container,
  Grid,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import RefreshIcon from '@mui/icons-material/Refresh';
import StoryCard from "./components/StoryCard";
import { useState, useMemo } from "react";
import { useHackerNews } from "./hooks/useHackerNews";

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

function App() {
  const [sort, setSort] = useState("latest");
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const [useCloudFunction, setUseCloudFunction] = useState(false);
  
  // Use React Query hook for data fetching
  const {
    stories,
    isLoading,
    error,
    isError,
    isFetching,
    lastUpdated,
    isCached,
    refetch,
  } = useHackerNews({ useCloudFunction });

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#FFA500',
          },
        },
      }),
    [mode],
  );

  // Sort stories client-side based on current sort preference
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
          return parseInt(b.timestamp) - parseInt(a.timestamp);
        case "oldest":
          return parseInt(a.timestamp) - parseInt(b.timestamp);
        default:
          return 0;
      }
    });
    return storiesToSort;
  }, [stories, sort]);

  const loading = isLoading || isFetching;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container sx={{ borderTop: '5px solid', borderColor: 'primary.main' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
          <Typography variant="h2" component="h1" gutterBottom align="center" style={{ margin: '0' }}>
            Hacker News AI Dev Feed
          </Typography>
          <IconButton sx={{ ml: 1 }} onClick={() => setMode(mode === 'light' ? 'dark' : 'light')} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
        
        {/* Data source toggle and refresh controls */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', marginBottom: 2, flexWrap: 'wrap' }}>
          <Button
            variant={useCloudFunction ? "contained" : "outlined"}
            onClick={() => setUseCloudFunction(!useCloudFunction)}
            size="small"
          >
            {useCloudFunction ? 'Live Data' : 'Static Data'}
          </Button>
          
          {useCloudFunction && (
            <Button
              variant="outlined"
              onClick={() => refetch()}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
              size="small"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          )}
          
          {lastUpdated && (
            <Chip
              label={`Updated: ${new Date(lastUpdated).toLocaleString()}`}
              size="small"
              color={isCached ? 'warning' : 'success'}
              variant="outlined"
            />
          )}
        </Box>
        
        {/* Error display */}
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
    </ThemeProvider>
  );
}

export default App;
