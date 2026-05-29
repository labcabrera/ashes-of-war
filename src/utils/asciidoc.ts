import Asciidoctor from '@asciidoctor/core';

const asciidoctor = Asciidoctor();

// Mark links whose href is an internal absolute path (/...) so that the
// useRouterLinks hook can intercept them via event delegation.
asciidoctor.Extensions.register(function () {
  this.postprocessor(function () {
    this.process(function (_doc, output) {
      return output.replace(
        /<a ([^>]*)href="(\/[^"]+)"([^>]*)>/g,
        '<a $1href="$2"$3 data-router-link="true">',
      );
    });
  });
});

/**
 * Converts an AsciiDoc source string to an HTML string using the official
 * Asciidoctor.js library. Safe mode is used to restrict potentially dangerous
 * macros; content is expected to be author-controlled static files.
 */
export function convertToHtml(source: string): string {
  return asciidoctor.convert(source, {
    safe: 'safe',
    attributes: { showtitle: true },
  }) as string;
}

/**
 * MUI `sx`-compatible styles for rendering Asciidoctor HTML output.
 * Targets the standard class names and elements produced by Asciidoctor.
 */
export const asciidocSx = {
  color: 'text.primary',
  // ── Headings ───────────────────────────────────────────────────────────────
  // h1 = document title (= in AsciiDoc)
  '& h1': { fontSize: '1.75rem', fontWeight: 700, mt: 1, mb: 2, lineHeight: 1.2 },
  // h2 = top-level section (==): prominent with a bottom divider
  '& h2': {
    fontSize: '1.35rem',
    fontWeight: 700,
    mt: 5,
    mb: 1.5,
    pb: 0.75,
    borderBottom: '1px solid',
    borderColor: 'divider',
    lineHeight: 1.3,
  },
  // h3 = subsection (===): left accent bar to show nesting
  '& h3': {
    fontSize: '1.05rem',
    fontWeight: 700,
    mt: 3,
    mb: 1,
    pl: 1.5,
    borderLeft: '3px solid',
    borderLeftColor: 'primary.main',
    lineHeight: 1.4,
  },
  // h4+ = deep headings: smaller, muted
  '& h4': { fontSize: '0.95rem', fontWeight: 600, mt: 2, mb: 0.75, color: 'text.secondary' },
  '& h5, & h6': { fontSize: '0.875rem', fontWeight: 600, mt: 1.5, mb: 0.5, color: 'text.secondary' },
  '& p': { mb: 1.5, lineHeight: 1.75 },
  '& ul, & ol': { pl: 3, mb: 2 },
  '& li': { mb: 0.5, lineHeight: 1.6 },
  '& a': { color: 'primary.main', textDecorationColor: 'primary.main', '&:hover': { opacity: 0.85 } },
  '& strong': { fontWeight: 700 },
  '& em': { fontStyle: 'italic' },
  '& .underline': { textDecoration: 'underline' },
  '& .line-through': { textDecoration: 'line-through' },
  '& code': {
    fontFamily: 'monospace',
    fontSize: '0.875em',
    bgcolor: 'action.hover',
    px: 0.5,
    py: 0.25,
    borderRadius: 0.5,
  },
  '& pre': {
    bgcolor: 'background.paper',
    border: 1,
    borderColor: 'divider',
    borderRadius: 1,
    p: 2,
    mb: 2,
    overflow: 'auto',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    '& code': { bgcolor: 'transparent', px: 0, py: 0 },
  },
  '& table': { borderCollapse: 'collapse', width: '100%', mb: 2, fontSize: '0.875rem' },
  '& td, & th': { border: 1, borderColor: 'divider', p: '6px 10px', verticalAlign: 'top' },
  '& th': { fontWeight: 700, bgcolor: 'background.paper' },
  '& tr:nth-of-type(even) td': { bgcolor: 'action.hover' },
  '& hr': { borderColor: 'divider', my: 2 },
  // ── Admonition blocks ──────────────────────────────────────────────────────
  // Base: reset the inner <table> so generic table rules don't interfere,
  // then style icon + content cells.
  '& .admonitionblock': {
    mb: 2,
    borderRadius: 1,
    overflow: 'hidden',
    '& table:not(.tableblock)': { width: '100%', mb: 0, fontSize: 'inherit' },
    '& td.icon, & td.content': { border: 0, verticalAlign: 'middle' },
    '& table:not(.tableblock) tr:nth-of-type(even) td': { bgcolor: 'transparent' },
    '& td.icon': {
      fontWeight: 700,
      whiteSpace: 'nowrap',
      width: '1%',
      px: 2,
      py: 1.5,
      fontSize: '0.78rem',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
    '& td.content': {
      px: 2,
      py: 1.5,
      '& p:last-child': { mb: 0 },
    },
  },
  '& .admonitionblock.note': {
    borderLeft: '4px solid',
    borderLeftColor: 'info.main',
    bgcolor: 'rgba(41, 182, 246, 0.08)',
    '& td.icon': { color: 'info.main' },
  },
  '& .admonitionblock.tip': {
    borderLeft: '4px solid',
    borderLeftColor: 'success.main',
    bgcolor: 'rgba(102, 187, 106, 0.08)',
    '& td.icon': { color: 'success.main' },
  },
  '& .admonitionblock.important': {
    borderLeft: '4px solid',
    borderLeftColor: 'warning.main',
    bgcolor: 'rgba(255, 167, 38, 0.08)',
    '& td.icon': { color: 'warning.main' },
  },
  '& .admonitionblock.caution': {
    borderLeft: '4px solid',
    borderLeftColor: 'warning.dark',
    bgcolor: 'rgba(239, 108, 0, 0.08)',
    '& td.icon': { color: 'warning.dark' },
  },
  '& .admonitionblock.warning': {
    borderLeft: '4px solid',
    borderLeftColor: 'error.main',
    bgcolor: 'rgba(244, 67, 54, 0.08)',
    '& td.icon': { color: 'error.main' },
  },
  '& #toc': {
    display: 'inline-block',
    minWidth: 200,
    bgcolor: 'background.paper',
    border: 1,
    borderColor: 'divider',
    borderRadius: 1,
    p: 2,
    mb: 3,
    '& #toctitle': { fontWeight: 700, mb: 1, fontSize: '0.9rem' },
    '& ul': { pl: 2, mb: 0 },
    '& li': { mb: 0.25, lineHeight: 1.5 },
    '& a': { fontSize: '0.875rem', color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main', textDecoration: 'underline' } },
  },
  '& .sect1': { mb: 3 },
  '& .sect2': { mb: 2 },
} as const;
