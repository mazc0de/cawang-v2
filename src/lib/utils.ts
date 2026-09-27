export function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  const datePart = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timePart = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
  return `${datePart}, ${timePart}`;
}

export function getCycleDates(cycleStartDate: number, baseDate: Date = new Date()) {
  let start = new Date(baseDate.getFullYear(), baseDate.getMonth(), cycleStartDate);
  let end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, cycleStartDate - 1, 23, 59, 59, 999);

  // If today is before the cycle start date, the cycle started in the previous month
  if (baseDate.getDate() < cycleStartDate) {
    start = new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, cycleStartDate);
    end = new Date(baseDate.getFullYear(), baseDate.getMonth(), cycleStartDate - 1, 23, 59, 59, 999);
  }

  return { start, end };
}
