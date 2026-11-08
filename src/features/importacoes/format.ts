/** Tempo entre o início e o fim ("4 min 12 s"); sem início, "—"; sem fim, "Em andamento". */
export function formatDuration(start: string | null, end: string | null) {
  if (!start) return "—";
  if (!end) return "Em andamento";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (Number.isNaN(ms) || ms < 0) return "—";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  return minutes < 60
    ? `${minutes} min ${seconds % 60} s`
    : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}
