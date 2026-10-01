/** "01 — THE MENU": the numbered running head every section opens with. */
export function SectionLabel({ index, label, className = "" }: { index: string; label: string; className?: string }) {
  return (
    <p className={`label flex items-center gap-3 text-detail ${className}`}>
      <span className="tnum">{index}</span>
      <span aria-hidden className="inline-block h-px w-8 bg-current opacity-70" />
      <span>{label}</span>
    </p>
  );
}
