import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Box
      sx={{
        border: '1px dashed rgba(15, 23, 42, 0.18)',
        borderRadius: 2,
        p: 3,
        bgcolor: 'rgba(2, 6, 23, 0.02)',
      }}
    >
      <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
        {description}
      </Typography>
    </Box>
  );
}
