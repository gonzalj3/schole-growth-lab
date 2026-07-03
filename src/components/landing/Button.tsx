// A landing-page CTA button. Two visual weights: the primary ask (brand-filled)
// and a secondary option (outline). Non-functional on the rendered page — the
// "click" is what the simulator models, not a real navigation.

export function CtaButton({
  label,
  variant = 'primary',
  size = 'md',
}: {
  label: string;
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'lg';
}) {
  const sizing = size === 'lg' ? 'px-7 py-3.5 text-base' : 'px-5 py-2.5 text-sm';
  const base =
    'inline-flex items-center justify-center rounded-lg font-medium transition-colors';
  const styles =
    variant === 'primary'
      ? 'bg-brand text-white hover:bg-brand-hover shadow-sm'
      : 'border border-line bg-surface text-ink hover:border-brand hover:text-brand';
  return (
    <span className={`${base} ${sizing} ${styles} cursor-pointer select-none`}>
      {label}
    </span>
  );
}
