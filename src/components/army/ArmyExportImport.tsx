/**
 * ArmyExportImport — export button, import button with hidden file input, and feedback Snackbar.
 * Implements FR-020 (export) and FR-021 (import) using only built-in Web APIs.
 */
import { useRef, useState } from 'react';
import { Box, Button, Snackbar, Alert } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useTranslation } from 'react-i18next';
import { Army } from '../../types/army';

interface Props {
  army: Army | null;
  onExport: () => void;
  onImport: (file: File) => void;
}

type SnackState = { open: boolean; severity: 'success' | 'error'; message: string };

export default function ArmyExportImport({ army, onExport, onImport }: Props) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [snack, setSnack] = useState<SnackState>({ open: false, severity: 'success', message: '' });

  const handleExport = () => {
    if (!army) return;
    onExport();
    setSnack({ open: true, severity: 'success', message: t('army.export.success') });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onImport(file);
    // Reset so the same file can be re-imported
    e.target.value = '';
  };

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<FileDownloadIcon />}
        onClick={handleExport}
        disabled={!army}
      >
        {t('army.export.button')}
      </Button>

      <Button
        variant="outlined"
        size="small"
        startIcon={<FileUploadIcon />}
        onClick={() => fileRef.current?.click()}
      >
        {t('army.import.button')}
      </Button>

      <input
        ref={fileRef}
        type="file"
        accept=".aow.json,application/json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
