/**
 * RulesContent - renders AsciiDoc rules chapters with MUI components.
 * Supports the subset used by public/content/rules: headings, paragraphs, lists,
 * preformatted examples, links, emphasis, and AsciiDoc tables.
 */
import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Box,
  CircularProgress,
  Divider,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RulesChapter } from '../../types/rules';

interface Props {
  chapter: RulesChapter;
  basePath: string;
}

type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'pre'; lines: string[] }
  | { type: 'table'; rows: string[][]; hasHeader: boolean }
  | { type: 'divider' };

function parseTableRow(line: string) {
  return line
    .split('|')
    .slice(1)
    .map((cell) => cell.trim())
    .filter((cell, index, cells) => cell.length > 0 || index < cells.length - 1);
}

function parseAsciiDoc(source: string): Block[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const lineAt = (lineIndex: number) => lines[lineIndex] ?? '';
  const blocks: Block[] = [];
  let index = 0;
  let nextTableHasHeader = false;

  while (index < lines.length) {
    const line = lineAt(index);
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (/^\[.*options="header".*\]$/.test(trimmed)) {
      nextTableHasHeader = true;
      index += 1;
      continue;
    }

    if (trimmed === '|===') {
      const rows: string[][] = [];
      index += 1;
      while (index < lines.length && lineAt(index).trim() !== '|===') {
        if (lineAt(index).trim().startsWith('|')) rows.push(parseTableRow(lineAt(index).trim()));
        index += 1;
      }
      blocks.push({ type: 'table', rows, hasHeader: nextTableHasHeader });
      nextTableHasHeader = false;
      index += 1;
      continue;
    }

    const heading = /^(=+)\s+(.+)$/.exec(trimmed);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1]?.length ?? 1, text: heading[2] ?? '' });
      index += 1;
      continue;
    }

    if (trimmed === "'''" || trimmed === '---') {
      blocks.push({ type: 'divider' });
      index += 1;
      continue;
    }

    if (/^\*\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^\*\s+/.test(lineAt(index).trim())) {
        items.push(lineAt(index).trim().replace(/^\*\s+/, ''));
        index += 1;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed) || /^\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && (/^\d+\.\s+/.test(lineAt(index).trim()) || /^\.\s+/.test(lineAt(index).trim()))) {
        items.push(lineAt(index).trim().replace(/^(?:\d+\.|\.)\s+/, ''));
        index += 1;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    if (/^\s+/.test(line)) {
      const preLines: string[] = [];
      while (index < lines.length && (/^\s+/.test(lineAt(index)) || !lineAt(index).trim())) {
        preLines.push(lineAt(index).replace(/^\t/, '  ').replace(/^ {2,}/, ''));
        index += 1;
      }
      blocks.push({ type: 'pre', lines: preLines });
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lineAt(index).trim() &&
      !/^(=+)\s+/.test(lineAt(index).trim()) &&
      !/^\*\s+/.test(lineAt(index).trim()) &&
      !/^\d+\.\s+/.test(lineAt(index).trim()) &&
      !/^\.\s+/.test(lineAt(index).trim()) &&
      lineAt(index).trim() !== '|===' &&
      !/^\[.*options="header".*\]$/.test(lineAt(index).trim()) &&
      !/^\s+/.test(lineAt(index))
    ) {
      paragraph.push(lineAt(index).trim());
      index += 1;
    }
    blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
  }

  return blocks;
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(https?:\/\/\S+)|\*([^*]+)\*|_([^_]+)_/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    if (match[1]) {
      nodes.push(
        <Link key={`link-${match.index}`} href={match[1]} target="_blank" rel="noreferrer">
          {match[1]}
        </Link>,
      );
    } else if (match[2]) {
      nodes.push(
        <Box key={`strong-${match.index}`} component="strong" sx={{ fontWeight: 700 }}>
          {match[2]}
        </Box>,
      );
    } else if (match[3]) {
      nodes.push(
        <Box key={`em-${match.index}`} component="em">
          {match[3]}
        </Box>,
      );
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function renderBlock(block: Block, index: number) {
  if (block.type === 'heading') {
    const variant = block.level === 1 ? 'h4' : block.level === 2 ? 'h5' : 'h6';
    return (
      <Typography key={index} variant={variant} gutterBottom sx={{ mt: block.level === 1 ? 3 : 2 }}>
        {renderInline(block.text)}
      </Typography>
    );
  }

  if (block.type === 'paragraph') {
    return (
      <Typography key={index} variant="body1" sx={{ mb: 2 }}>
        {renderInline(block.text)}
      </Typography>
    );
  }

  if (block.type === 'ul' || block.type === 'ol') {
    const Component = block.type === 'ul' ? 'ul' : 'ol';
    return (
      <Box key={index} component={Component} sx={{ pl: 3, mb: 2 }}>
        {block.items.map((item, itemIndex) => (
          <Typography key={`${index}-${itemIndex}`} component="li" variant="body1" sx={{ mb: 0.5 }}>
            {renderInline(item)}
          </Typography>
        ))}
      </Box>
    );
  }

  if (block.type === 'pre') {
    return (
      <Box
        key={index}
        component="pre"
        sx={{
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          overflowX: 'auto',
          p: 2,
          mb: 2,
          fontFamily: 'monospace',
          fontSize: '0.9rem',
        }}
      >
        {block.lines.join('\n')}
      </Box>
    );
  }

  if (block.type === 'table') {
    const bodyRows = block.hasHeader ? block.rows.slice(1) : block.rows;
    const headerRows = block.hasHeader ? block.rows.slice(0, 1) : [];
    return (
      <TableContainer key={index} sx={{ mb: 2 }}>
        <Table size="small">
          {headerRows.length > 0 && (
            <TableHead>
              {headerRows.map((row, rowIndex) => (
                <TableRow key={`head-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={`head-${cellIndex}`} sx={{ fontWeight: 700 }}>
                      {renderInline(cell)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
          )}
          <TableBody>
            {bodyRows.map((row, rowIndex) => (
              <TableRow key={`body-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={`body-${cellIndex}`}>{renderInline(cell)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return <Divider key={index} sx={{ my: 2 }} />;
}

export default function RulesContent({ chapter, basePath }: Props) {
  const { i18n, t } = useTranslation();

  type ChapterState = { key: string; content: string | null; error: boolean };
  const [chapterState, setChapterState] = useState<ChapterState>({ key: '', content: null, error: false });

  const lang = i18n.resolvedLanguage ?? 'en';
  const chapterKey = `${chapter.id}-${lang}`;
  const loading = chapterState.key !== chapterKey;
  const content = loading ? null : chapterState.content;
  const error = loading ? false : chapterState.error;
  const blocks = useMemo(() => (content ? parseAsciiDoc(content) : []), [content]);

  useEffect(() => {
    let cancelled = false;
    const currentLang = i18n.resolvedLanguage ?? 'en';
    const url = currentLang === 'es' && chapter.files?.es ? chapter.files.es : chapter.files?.en;
    const key = `${chapter.id}-${currentLang}`;
    if (!url) {
      Promise.resolve().then(() => {
        if (!cancelled) setChapterState({ key, content: '', error: false });
      });
      return () => {
        cancelled = true;
      };
    }
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setChapterState({ key, content: text, error: false });
      })
      .catch(() => {
        if (!cancelled) setChapterState({ key, content: null, error: true });
      });
    return () => {
      cancelled = true;
    };
  }, [chapter, i18n.resolvedLanguage]);

  if (loading) return <CircularProgress sx={{ m: 4 }} />;
  if (error || content === null) {
    return (
      <Typography color="error" sx={{ m: 2 }}>
        {t('common.error')}
      </Typography>
    );
  }

  return (
    <Box sx={{ maxWidth: 880, px: 2, pb: 4 }}>
      {blocks.map(renderBlock)}
      {chapter.children && chapter.children.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('rules.subchapters')}
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 0 }}>
            {chapter.children.map((child) => (
              <Typography key={child.id} component="li" variant="body1" sx={{ mb: 0.75 }}>
                <Link component={RouterLink} to={`/rules/${basePath}/${child.id}`}>
                  {t(child.titleKey)}
                </Link>
              </Typography>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
