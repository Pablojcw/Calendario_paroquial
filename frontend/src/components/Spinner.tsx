export function Spinner({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className="spinner" role="status">
      {label}
    </div>
  );
}