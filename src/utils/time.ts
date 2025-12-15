// Accepts milliseconds; returns variable format:
// - If hours > 0:    hh:mm:ss:ms
// - Else if mins > 0:mm:ss:ms
// - Else:            ss:ms
export function formatTime(ms: number): string {
  const totalMs = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.floor(totalMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes + hours * 60).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return `${mm}:${ss}`;
}
