"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

let locks = 0;

/**
 * Modal behaviour for a container: traps Tab, closes on Escape, locks page
 * scroll, moves focus inside on open and restores it to the opener on close.
 */
export function useDialog(ref: RefObject<HTMLElement | null>, active: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!active) return;
    const opener = document.activeElement as HTMLElement | null;
    const node = ref.current;

    // Scroll lock that doesn't make the page jump when the scrollbar disappears.
    if (locks++ === 0) {
      const sw = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = "hidden";
      document.body.style.paddingRight = sw ? `${sw}px` : "";
    }

    const focusFirst = () => {
      const target = node?.querySelector<HTMLElement>("[data-autofocus]") ?? node?.querySelector<HTMLElement>(FOCUSABLE);
      target?.focus({ preventScroll: true });
    };
    const id = requestAnimationFrame(focusFirst);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const items = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !node.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);

    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("keydown", onKey, true);
      if (--locks === 0) {
        document.documentElement.style.overflow = "";
        document.body.style.paddingRight = "";
      }
      // Only hand focus back if it hasn't already moved on (e.g. into another dialog).
      const active = document.activeElement;
      if (!active || active === document.body || node?.contains(active)) opener?.focus?.({ preventScroll: true });
    };
  }, [active, ref]);
}
