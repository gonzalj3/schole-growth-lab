// Hand-built product mocks for the hero. No external images (keeps the app
// self-contained and fast). Two flavors, chosen by the `heroLayout` gene:
//   dashboard_demo — a mock admin adoption dashboard (the "prove it" story).
//   split_image    — a mock role-specific learning path (the "capability" story).

function Bar({ label, pct, tone }: { label: string; pct: number; tone: 'brand' | 'accent' | 'positive' }) {
  const color =
    tone === 'brand' ? 'bg-brand' : tone === 'accent' ? 'bg-accent' : 'bg-positive';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] text-muted">
        <span>{label}</span>
        <span className="tnum">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-line">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function DashboardMock() {
  return (
    <div className="w-full rounded-2xl border border-line bg-surface p-5 shadow-[0_20px_60px_-30px_rgba(27,30,40,0.35)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted">Admin dashboard</div>
          <div className="font-display text-lg font-semibold text-ink">
            Team AI adoption
          </div>
        </div>
        <div className="rounded-full bg-positive/10 px-2.5 py-1 text-[11px] font-medium text-positive">
          +38% this quarter
        </div>
      </div>
      <div className="space-y-3">
        <Bar label="Sales" pct={82} tone="brand" />
        <Bar label="Support" pct={74} tone="brand" />
        <Bar label="Operations" pct={61} tone="accent" />
        <Bar label="Marketing" pct={56} tone="accent" />
        <Bar label="Finance" pct={43} tone="positive" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 text-center">
        <div>
          <div className="tnum text-lg font-semibold text-ink">128</div>
          <div className="text-[11px] text-muted">learners</div>
        </div>
        <div>
          <div className="tnum text-lg font-semibold text-ink">64%</div>
          <div className="text-[11px] text-muted">mastery</div>
        </div>
        <div>
          <div className="tnum text-lg font-semibold text-ink">9.1</div>
          <div className="text-[11px] text-muted">NPS</div>
        </div>
      </div>
    </div>
  );
}

export function LearningPathMock() {
  const steps = [
    { role: 'Analyst', skill: 'Verify model output', done: true },
    { role: 'Marketer', skill: 'Structure a prompt', done: true },
    { role: 'PM', skill: 'Draft a spec with AI', done: false },
  ];
  return (
    <div className="w-full rounded-2xl border border-line bg-surface p-5 shadow-[0_20px_60px_-30px_rgba(27,30,40,0.35)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-display text-lg font-semibold text-ink">
          Role-specific path
        </div>
        <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand">
          adaptive
        </span>
      </div>
      <div className="space-y-3">
        {steps.map((s) => (
          <div
            key={s.role}
            className="flex items-center gap-3 rounded-xl border border-line bg-paper/60 p-3"
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                s.done ? 'bg-positive text-white' : 'border border-line bg-surface text-muted'
              }`}
            >
              {s.done ? '✓' : '•'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-ink">{s.skill}</div>
              <div className="text-[11px] text-muted">for {s.role} · grounded in your tools</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-[11px] text-muted">
        <span className="inline-block h-2 w-2 rounded-full bg-accent" />
        Next lesson unlocks in the zone of proximal development
      </div>
    </div>
  );
}
