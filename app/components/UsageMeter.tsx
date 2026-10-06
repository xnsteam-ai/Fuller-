export function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
  const color = used >= limit ? 'bg-danger' : pct >= 80 ? 'bg-warning' : 'bg-accent';
  return (
    <div className="grid gap-1">
      <div className="flex justify-between text-sm"><span className="font-semibold">{label}</span><span>{used} of {limit} this month</span></div>
      <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={limit} aria-valuenow={Math.min(used, limit)} className="h-3 overflow-hidden rounded-pill bg-surface">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {used >= limit && <p className="text-sm text-danger">You have reached this allowance. It resets next month.</p>}
    </div>
  );
}
