import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Returns a callback ref to attach to a container element. Clicks on any
 * descendant `<a data-router-link="true">` are intercepted and handled via
 * React Router's `navigate()` instead of triggering a full page reload.
 *
 * A callback ref is used (instead of useRef + useEffect) so the listener is
 * attached as soon as the node enters the DOM, even when the element is
 * rendered conditionally after an async fetch.
 *
 * Links are marked by the Asciidoctor postprocessor registered in
 * `src/utils/asciidoc.ts` for hrefs that start with `/`.
 */
export function useRouterLinks<T extends HTMLElement = HTMLDivElement>() {
  const navigate = useNavigate();
  const cleanupRef = useRef<(() => void) | null>(null);

  const ref = useCallback(
    (node: T | null) => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      if (!node) return;

      const handleClick = (e: MouseEvent) => {
        const anchor = (e.target as Element).closest<HTMLAnchorElement>('a[data-router-link]');
        if (!anchor) return;
        const href = anchor.getAttribute('href');
        if (href) {
          e.preventDefault();
          navigate(href);
        }
      };

      node.addEventListener('click', handleClick);
      cleanupRef.current = () => node.removeEventListener('click', handleClick);
    },
    [navigate],
  );

  return ref;
}
