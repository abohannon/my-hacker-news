import {
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import stories from "./hn_stories.json";

interface Story {
  id: string;
  title: string;
  text: string | null;
  url: string | null;
  timestamp: string;
}

function App() {
  const stripHtml = (html: string | null) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "");
  };

  return (
    <Container>
      <Typography variant="h2" component="h1" gutterBottom align="center" style={{ margin: '20px 0' }}>
        Hacker News Feed
      </Typography>
      <Grid container spacing={3}>
        {(stories as Story[]).map((story) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={story.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardActionArea
                component="a"
                href={story.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                disabled={!story.url}
                sx={{ flexGrow: 1 }}
              >
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {story.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stripHtml(story.text)}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardContent>
                 <Typography variant="caption" color="text.secondary">
                    {new Date(story.timestamp).toLocaleString()}
                  </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default App;
