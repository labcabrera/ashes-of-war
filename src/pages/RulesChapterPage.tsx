/**
 * RulesChapterPage — renders a specific rules chapter by its ID.
 * Loads the rules index to resolve the chapter file path.
 */
import { useEffect, useState } from 'react';
import { Box, Typography, Paper, useMediaQuery, useTheme } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RulesChapterList from '../components/rules/RulesChapterList';
import RulesContent from '../components/rules/RulesContent';
import { RulesIndex, RulesChapter } from '../types/rules';

function findChapter(chapters: RulesChapter[], path: string[]): RulesChapter | null {
  const [currentId, ...rest] = path;
  const current = chapters.find((candidate) => candidate.id === currentId);
  if (!current) return null;
  if (rest.length === 0) return current;
  return current.children ? findChapter(current.children, rest) : null;
}

export default function RulesChapterPage() {
  const { chapterId, subchapterId } = useParams<{ chapterId: string; subchapterId?: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [index, setIndex] = useState<RulesIndex | null>(null);
  const [chapter, setChapter] = useState<RulesChapter | null>(null);
  const selectedPath = [chapterId, subchapterId].filter(Boolean).join('/');

  useEffect(() => {
    fetch('/content/rules/index.json')
      .then((r) => r.json())
      .then((data: RulesIndex) => {
        setIndex(data);
        const found = chapterId ? findChapter(data.chapters, [chapterId, subchapterId].filter(Boolean) as string[]) : null;
        setChapter(found);
      })
      .catch(() => setIndex(null));
  }, [chapterId, subchapterId]);

  const handleSelect = (path: string) => {
    navigate(`/rules/${path}`);
  };

  const sidebar = index ? (
    <RulesChapterList
      chapters={index.chapters}
      selectedId={selectedPath || null}
      onSelect={handleSelect}
    />
  ) : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
      {isDesktop ? (
        <Paper sx={{ width: 280, flexShrink: 0, alignSelf: 'flex-start', position: 'sticky', top: 82, maxHeight: 'calc(100vh - 98px)', overflow: 'auto' }}>
          {sidebar}
        </Paper>
      ) : (
        <Paper sx={{ p: 1, position: 'sticky', top: 58, zIndex: 1 }}>
          {index ? (
            <RulesChapterList
              chapters={index.chapters}
              selectedId={selectedPath || null}
              onSelect={handleSelect}
              variant="rail"
            />
          ) : null}
        </Paper>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {chapter ? (
          <RulesContent chapter={chapter} basePath={selectedPath} />
        ) : (
          <Typography sx={{ mt: 4 }} color="text.secondary">
            {chapterId ? t('common.error') : t('rules.selectChapter')}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
