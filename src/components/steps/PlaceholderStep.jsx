export default function PlaceholderStep({ title, note }) {
  return (
    <section className="rounded-md border border-dashed border-slate-500 bg-white p-4">
      <p className="font-semibold text-slate-900">{title} is not built yet</p>
      <p className="mt-1 text-sm text-slate-700">{note}</p>
    </section>
  );
}
