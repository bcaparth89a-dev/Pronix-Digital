export function AdminShellPage({ title }) {
  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Management screen architecture placeholder.</p>
      </div>
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        {title} module shell is ready for future management UI.
      </div>
    </section>
  );
}

