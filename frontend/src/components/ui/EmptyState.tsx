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
        border: '1px dashed rgba(111, 70, 190, 0.28)',
        borderRadius: 3,
        p: { xs: 2.5, sm: 3 },
        bgcolor: 'rgba(111, 70, 190, 0.03)',
      }}
    >
      <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {description}
      </Typography>
    </Box>
  );
}
