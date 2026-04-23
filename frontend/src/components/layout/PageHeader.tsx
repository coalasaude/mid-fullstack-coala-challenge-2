import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type PageHeaderProps = {
  title: string;
  subtitle: string;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
        HealthFlow
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 860 }}>
        {subtitle}
      </Typography>
    </Box>
  );
}
