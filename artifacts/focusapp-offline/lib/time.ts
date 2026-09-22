export function formatTimer(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60).toString().padStart(2, '0');
  const remaining = (safe % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`;
}

export function formatMinutes(seconds: number) {
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return '< 1 min';
  return `${minutes} min`;
}

export function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(timestamp);
}