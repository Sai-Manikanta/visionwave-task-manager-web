// Calendar days are 'yyyy-MM-dd' strings, formatted in UTC so they never shift a day.
export function formatDay(day, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!day) return '—';
  return new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'UTC' }).format(new Date(`${day}T00:00:00Z`));
}

export function formatDateTime(iso) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(
    new Date(iso),
  );
}

export function addDays(day, count) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}
