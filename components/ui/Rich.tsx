import { Fragment } from "react";

/** Renders `*word*` as <em>. Used for the single italic accent in headlines. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("*") && p.endsWith("*") ? <em key={i}>{p.slice(1, -1)}</em> : <Fragment key={i}>{p}</Fragment>,
      )}
    </>
  );
}

/** Plain text version (for aria-labels / metadata). */
export const plain = (text: string) => text.replace(/\*/g, "").replace(/\|/g, " ");
