/**
 * RulesChapterPage — renders a specific rules chapter by its ID.
 * Loads the rules index to resolve the chapter file path.
 */
import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Drawer, useMediaQuery, useTheme, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RulesChapterList from '../components/rules/RulesChapterList';
import RulesContent from '../components/rules/RulesContent';
import { RulesIndex, RulesChapter } from '../types/rules';

export default function RulesChapterPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [index, setIndex] = useState<RulesIndex | null>(null);
  const [chapter, setChapter] = useState<RulesChapter | null>(null);

  useEffect(() => {
    fetch('/content/rules/index.json')
      .then((r) => r.json())
      .then((data: RulesIndex) => {
        setIndex(data);
        const found = data.chapters.find((c) => c.id === chapterId) ?? null;
        setChapter(found);
      })
      .catch(() => setIndex(null));
  }, [chapterId]);

  const handleSelect = (id: string) => {
    navigate(`/rules/${id}`);
    setDrawerOpen(false);
  };

  const sidebar = index ? (
    <RulesChapterList
      chapters={index.chapters}
      selectedId={chapterId ?? null}
      onSelect={handleSelect}
    />
  ) : null;

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {isDesktop ? (
        <Paper sx={{ minWidth: 220, alignSelf: 'flex-start' }}>{sidebar}</Paper>
      ) : (
        <>
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ alignSelf: 'flex-start' }}>
            <MenuIcon />
          </IconButton>
          <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            <Box sx={{ width: 260 }}>{sidebar}</Box>
          </Drawer>
        </>
      )}

      <Box sx={{ flex: 1 }}>
        {chapter ? (
          <RulesContent chapter={chapter} />
        ) : (
          <Typography sx={{ mt: 4 }} color="text.secondary">
            {chapterId ? t('common.error') : t('rules.selectChapter')}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
