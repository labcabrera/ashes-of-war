/**
 * WikiContent loads and presents the controlled AsciiDoc subset used by Wiki articles.
 * The parser intentionally supports only authored content constructs and never injects HTML.
 */
import { Fragment, ReactNode, useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { WikiArticle } from '../../types/wiki';

interface Props {
  article: WikiArticle;
}

type WikiBlock =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'table'; rows: string[][] };

function parseAsciiDoc(content: string): WikiBlock[] {
  const lines = content.replace(/\r/g, '').split('\n');
  const blocks: WikiBlock[] = [];
  let lineIndex = 0;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ kind: 'paragraph', text: paragraph.join(' ') });
      paragraph = [];
    }
  };

  while (lineIndex < lines.length) {
    const line = lines[lineIndex] ?? '';
    const trimmed = line.trim();
    const heading = /^(={1,4})\s+(.+)$/.exec(trimmed);

    if (!trimmed) {
      flushParagraph();
      lineIndex += 1;
      continue;
    }

    if (trimmed.startsWith(':')) {
      flushParagraph();
      lineIndex += 1;
      continue;
    }

    if (heading) {
      flushParagraph();
      blocks.push({ kind: 'heading', level: heading[1]?.length ?? 1, text: heading[2] ?? '' });
      lineIndex += 1;
      continue;
    }

    if (trimmed === '|===') {
      flushParagraph();
      const rows: string[][] = [];
      lineIndex += 1;
      while (lineIndex < lines.length && (lines[lineIndex] ?? '').trim() !== '|===') {
        const row = (lines[lineIndex] ?? '').trim();
        if (row.startsWith('|')) {
          rows.push(row.slice(1).split('|').map((cell) => cell.trim()));
        }
        lineIndex += 1;
      }
      blocks.push({ kind: 'table', rows });
      lineIndex += 1;
      continue;
    }

    if (trimmed.startsWith('* ')) {
      flushParagraph();
      const items: string[] = [];
      while (lineIndex < lines.length && (lines[lineIndex] ?? '').trim().startsWith('* ')) {
        items.push((lines[lineIndex] ?? '').trim().slice(2));
        lineIndex += 1;
      }
      blocks.push({ kind: 'list', items });
      continue;
    }

    paragraph.push(trimmed);
    lineIndex += 1;
  }

  flushParagraph();
  return blocks;
}

function renderInline(text: string): ReactNode[] {
  const tokens = /(link:(https?:\/\/[^[]+)\[([^]]+)\]|\*([^*]+)\*|`([^`]+)`)/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tokens.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }
    if (match[2]) {
      nodes.push(
        <Link key={`${match.index}-link`} href={match[2]} target="_blank" rel="noreferrer">
          {match[3]}
        </Link>,
      );
    } else if (match[4]) {
      nodes.push(<Box key={`${match.index}-strong`} component="strong">{match[4]}</Box>);
    } else {
      nodes.push(<Box key={`${match.index}-code`} component="code" sx={{ fontFamily: 'monospace' }}>{match[5]}</Box>);
    }
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }
  return nodes;
}

function renderHeading(level: number, text: string) {
  const variant = level === 1 ? 'h4' : level === 2 ? 'h5' : 'h6';
  const component = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';

  return (
    <Typography component={component} variant={variant} gutterBottom sx={{ mt: level === 1 ? 1 : 3 }}>
      {renderInline(text)}
    </Typography>
  );
}

export default function WikiContent({ article }: Props) {
  const { i18n, t } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'es';
  const articleKey = `${article.id}-${language}`;
  const [state, setState] = useState<{ key: string; content: string | null; error: boolean }>({
    key: '',
    content: null,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;
    const requestedLanguage = i18n.resolvedLanguage ?? 'es';
    const url = requestedLanguage === 'en' && article.files.en ? article.files.en : article.files.es;
    const key = `${article.id}-${requestedLanguage}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then((content) => {
        if (!cancelled) setState({ key, content, error: false });
      })
      .catch(() => {
        if (!cancelled) setState({ key, content: null, error: true });
      });

    return () => { cancelled = true; };
  }, [article, i18n.resolvedLanguage]);

  if (state.key !== articleKey) return <CircularProgress sx={{ m: 4 }} />;
  if (state.error || state.content === null) {
    return <Typography color="error" sx={{ m: 2 }}>{t('common.error')}</Typography>;
  }

  const blocks = parseAsciiDoc(state.content);

  return (
    <Box component="article" sx={{ maxWidth: 900, px: { xs: 1, sm: 2 }, pb: 4 }}>
      {blocks.map((block, index) => (
        <Fragment key={`${block.kind}-${index}`}>
          {block.kind === 'heading' && renderHeading(block.level, block.text)}
          {block.kind === 'paragraph' && (
            <Typography variant="body1" sx={{ mb: 2 }}>
              {renderInline(block.text)}
            </Typography>
          )}
          {block.kind === 'list' && (
            <Box component="ul" sx={{ mt: 0, mb: 2, pl: 3 }}>
              {block.items.map((item) => (
                <Typography key={item} component="li" variant="body1" sx={{ mb: 0.5 }}>
                  {renderInline(item)}
                </Typography>
              ))}
            </Box>
          )}
          {block.kind === 'table' && block.rows.length > 0 && (
            <TableContainer sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {block.rows[0]?.map((cell) => (
                      <TableCell key={cell} sx={{ fontWeight: 700 }}>{renderInline(cell)}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {block.rows.slice(1).map((row) => (
                    <TableRow key={row.join('-')}>
                      {row.map((cell) => <TableCell key={cell}>{renderInline(cell)}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Fragment>
      ))}
    </Box>
  );
}
