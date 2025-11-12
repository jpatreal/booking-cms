// src/utils/time.ts
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { addMinutes } from 'date-fns';

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

/**
 * Convert business-local date + time + duration to UTC range.
 * Uses date-fns-tz v3:
 * - fromZonedTime(localDateTime, tz) => Date in UTC
 */
export function buildUtcRangeFromBizLocal(options: {
  date: string; // 'YYYY-MM-DD' in business local
  startTime: string; // 'HH:mm' in business local
  durationMin: number;
  businessTz: string;
}) {
  const { date, startTime, durationMin, businessTz } = options;

  const [hStr = '0', mStr = '0'] = startTime.split(':');
  const h = Number(hStr);
  const m = Number(mStr);

  const localIso = `${date}T${pad2(h)}:${pad2(m)}:00`;

  // Interpret localIso as time in businessTz, convert to UTC instant
  const startUtc = fromZonedTime(localIso, businessTz || 'UTC');
  const endUtc = addMinutes(startUtc, durationMin || 0);

  return {
    startUtc: startUtc.toISOString(),
    endUtc: endUtc.toISOString(),
  };
}

/**
 * Convert UTC ISO string to business-local date + time parts.
 * Uses date-fns-tz v3:
 * - toZonedTime(utcDate, tz) => Date in that zone (same instant)
 */
export function utcToBizLocalParts(isoUtc: string, businessTz: string) {
  const d = toZonedTime(isoUtc, businessTz || 'UTC');
  if (Number.isNaN(d.getTime())) return { date: '', time: '' };

  const pad = (n: number) => n.toString().padStart(2, '0');

  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}
