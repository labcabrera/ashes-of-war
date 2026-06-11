/**
 * Shared building blocks for catalogue filter sidebars (units, weapons, ...):
 * collapsible filter sections and labeled option rows with optional counts.
 */
import { ReactNode } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Accordion
      defaultExpanded
      disableGutters
      elevation={0}
      square
      sx={{
        bgcolor: 'transparent',
        '&:before': { display: 'none' },
        borderBottom: 1,
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 0 },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon fontSize="small" />}
        sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { my: 1 } }}
      >
        <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.12em', color: 'text.secondary' }}>
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, pb: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}

export const optionRowSx = {
  width: '100%',
  ml: 0,
  '& .MuiFormControlLabel-label': { width: '100%' },
};

export function OptionRow({ count, children }: { count?: number; children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>{children}</Box>
      {count !== undefined && (
        <Typography variant="body2" color="text.secondary">
          {count}
        </Typography>
      )}
    </Box>
  );
}
