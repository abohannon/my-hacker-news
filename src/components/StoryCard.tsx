import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Link,
  Typography,
} from "@mui/material";
import type { Story } from "../App";

interface StoryCardProps {
  story: Story;
}

const StoryCard = ({ story }: StoryCardProps) => {
  const processText = (html: string | null) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const textContent = doc.body.textContent || "";
    if (textContent.length > 200) {
      return textContent.substring(0, 200) + '...';
    }
    return textContent;
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea
        component="a"
        href={story.url || `https://news.ycombinator.com/item?id=${story.id}`}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ flexGrow: 1 }}
      >
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {story.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {processText(story.text)}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          {story.score && (
            <Typography variant="caption" color="text.secondary">
              Score: {story.score}
            </Typography>
          )}
          <Link href={`https://news.ycombinator.com/item?id=${story.id}`} target="_blank" rel="noopener noreferrer" variant="caption">
            {story.descendants || 0} comment{story.descendants !== '1' ? 's' : ''}
          </Link>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {new Date(story.timestamp).toLocaleString()}
        </Typography>
        {story.parent && (
          <Link href={`https://news.ycombinator.com/item?id=${story.parent}`} target="_blank" rel="noopener noreferrer" variant="caption" sx={{ display: 'block', mt: 1 }}>
            View Parent
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

export default StoryCard;
