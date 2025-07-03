import { Container, Typography, Paper, Box, Chip } from '@mui/material';

const keywords = [
  'LLM', 'Large Language Model', 'ChatGPT', 'GPT', 'Claude', 'Anthropic',
  'Gemini', 'Bard', 'Copilot', 'CodeWhisperer', 'Replit', 'Cursor', 'Windsurf',
  'AI Coding', 'Vibe Coding', 'Agentic', 'Code Generation', 'Code Assistant',
  'AI Pair Programming', 'Prompt Engineering', 'Code Completion', 'AI Code Review',
  'Automated Testing', 'AI Debugging', 'Machine Learning Ops', 'MLOps',
  'AI Workflow', 'Developer Productivity', 'AI Tooling', 'Intelligent IDE',
  'Smart Autocomplete', 'AI Refactoring', 'Automated Documentation',
  'V0', 'Bolt.new', 'Lovable', 'Devin', 'AI Agent', 'Coding Agent'
];

export default function About() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>

        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
          I built this site because I was getting tired of scrolling through all of Hacker News trying to find the good stuff about AI and how it actually impacts my day-to-day work as a developer.
        </Typography>

        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
          So I created this filter to surface posts about AI tools like Copilot, Cursor, Claude, and all the other assistants that are actually useful in real development work. Plus discussions about prompt engineering, AI code review, automated testing, and the whole ecosystem of tools that are changing how we code.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
          What Gets Filtered In
        </Typography>

        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
          The site looks for posts mentioning these keywords (and variations):
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
          {keywords.map((keyword, index) => (
            <Chip
              key={index}
              label={keyword}
              variant="outlined"
              size="small"
              sx={{
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            />
          ))}
        </Box>

        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
          The data refreshes every hour. I'll adjust this filter
          (add/remove keywords) as needed over time as new AI tools and trends emerge.
        </Typography>

      </Paper>
    </Container>
  );
}
