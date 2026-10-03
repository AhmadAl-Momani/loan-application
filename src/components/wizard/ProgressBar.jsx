export default function ProgressBar({ steps, currentIndex }) {
  const n = currentIndex + 1;
  const total = steps.length;
  const label = `Step ${n} of ${total}: ${steps[currentIndex].title}`;
  return (
    <nav aria-label="Application progress" className="mb-6">
      <p className="mb-2 text-sm font-semibold text-slate-900">{label}</p>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={n}
        className="h-2 w-full overflow-hidden rounded bg-slate-300"
      >
        <div className="h-full bg-primary transition-all duration-150" style={{ width: `${(n / total) * 100}%` }} />
      </div>
    </nav>
  );
}
