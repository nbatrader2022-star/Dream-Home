import { useEffect } from 'react';

/**
 * Custom hook to lock the body scroll when a modal or drawer is open.
 * Completely prevents background scroll leaking on iOS, Android, and desktop browsers,
 * while preserving scroll position upon closing and avoiding layout shift.
 */
export function useLockBodyScroll(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked || typeof window === 'undefined') return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const originalPaddingRight = document.body.style.paddingRight;
    const originalOverscroll = document.body.style.overscrollBehavior;
    const scrollY = window.scrollY;

    // Compensate scrollbar width to prevent content jumping
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      document.body.style.paddingRight = originalPaddingRight;
      document.body.style.overscrollBehavior = originalOverscroll;
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}
