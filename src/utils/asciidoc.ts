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
  fontSize: { xs: '1.06rem', sm: '1.12rem' },
  lineHeight: 1.75,
  // ── Headings ───────────────────────────────────────────────────────────────
  // h1 = document title (= in AsciiDoc)
  '& h1': { fontSize: { xs: '2rem', sm: '2.25rem' }, fontWeight: 700, mt: 1, mb: 2.5, lineHeight: 1.2 },
  // h2 = top-level section (==): strong visual break between major rule sections
  '& h2': {
    fontSize: { xs: '1.58rem', sm: '1.78rem' },
    fontWeight: 800,
    mt: 5.5,
    mb: 2,
    px: { xs: 1.5, sm: 2 },
    py: 1.15,
    color: 'secondary.light',
    bgcolor: 'rgba(200, 168, 75, 0.1)',
    border: '1px solid',
    borderColor: 'rgba(200, 168, 75, 0.34)',
    borderLeft: '7px solid',
    borderLeftColor: 'secondary.main',
    borderRadius: 0.75,
    boxShadow: 'inset 0 0 0 1px rgba(240, 237, 232, 0.03)',
    lineHeight: 1.28,
  },
  // h3 = subsection (===): emphasized block heading for rule subsections
  '& h3': {
    fontSize: { xs: '1.26rem', sm: '1.38rem' },
    fontWeight: 800,
    mt: 3.5,
    mb: 1.35,
    px: 1.5,
    py: 0.8,
    color: 'text.primary',
    bgcolor: 'rgba(75, 80, 88, 0.34)',
    borderLeft: '5px solid',
    borderLeftColor: 'secondary.main',
    borderBottom: '1px solid',
    borderBottomColor: 'rgba(200, 168, 75, 0.22)',
    borderRadius: 0.5,
    lineHeight: 1.35,
  },
  // h4+ = deep headings: smaller, muted
  '& h4': { fontSize: '1.12rem', fontWeight: 600, mt: 2.5, mb: 0.9, color: 'text.secondary' },
  '& h5, & h6': { fontSize: '1rem', fontWeight: 600, mt: 1.75, mb: 0.75, color: 'text.secondary' },
  '& p': { mb: 1.75, lineHeight: 1.8 },
  '& ul, & ol': { pl: 3, mb: 2 },
  '& li': { mb: 0.65, lineHeight: 1.7 },
  '& a': { color: 'primary.main', textDecorationColor: 'primary.main', '&:hover': { opacity: 0.85 } },
  '& strong': { fontWeight: 700 },
  '& em': { fontStyle: 'italic' },
  '& .underline': { textDecoration: 'underline' },
  '& .line-through': { textDecoration: 'line-through' },
  '& code': {
    fontFamily: 'monospace',
    fontSize: '0.92em',
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
    fontSize: '0.98rem',
    '& code': { bgcolor: 'transparent', px: 0, py: 0 },
  },
  '& table': { borderCollapse: 'collapse', width: '100%', mb: 2.5, fontSize: '0.98rem' },
  '& td, & th': { border: 1, borderColor: 'divider', p: '8px 12px', verticalAlign: 'top' },
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
      fontSize: '0.88rem',
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
    '& #toctitle': { fontWeight: 700, mb: 1, fontSize: '1rem' },
    '& ul': { pl: 2, mb: 0 },
    '& li': { mb: 0.35, lineHeight: 1.55 },
    '& a': { fontSize: '0.98rem', color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main', textDecoration: 'underline' } },
  },
  '& .sect1': { mb: 3 },
  '& .sect2': { mb: 2 },
} as const;
