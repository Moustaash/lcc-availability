import { RawBooking } from '../types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

interface CalendarLineMetadata {
  key: string;
  params: Record<string, string>;
}

interface ParsedIcsEvent {
  start?: Date | null;
  end?: Date | null;
  duration?: string;
  summary?: string;
  description?: string;
  status?: string;
  lastModified?: Date | null;
  dtStamp?: Date | null;
  uid?: string;
}

const ICS_STATUS_CANCELLED = 'cancelled';

const OPTION_KEYWORDS = ['option', 'tentative', 'pre-book'];

const ICS_ESCAPE_SEQUENCES: Record<string, string> = {
  '\\n': '\n',
  '\\,': ',',
  '\\;': ';',
  '\\\\': '\\',
};

const DEFAULT_LOTREF_FOR_SLUG = (slug: string) => slug.replace(/-/g, '-').toUpperCase();

const parseCalendarLineMetadata = (raw: string): CalendarLineMetadata => {
  const [key, ...params] = raw.split(';');
  const paramMap: Record<string, string> = {};
  for (const param of params) {
    const [name, value] = param.split('=');
    if (name && value) {
      paramMap[name.toUpperCase()] = value;
    }
  }
  return { key: key.toUpperCase(), params: paramMap };
};

const normalizeNewlines = (ics: string): string => ics.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

const unfoldLines = (ics: string): string[] => {
  const normalized = normalizeNewlines(ics);
  const rawLines = normalized.split('\n');
  const lines: string[] = [];
  for (const rawLine of rawLines) {
    if (/^[ \t]/.test(rawLine) && lines.length > 0) {
      lines[lines.length - 1] += rawLine.slice(1);
    } else {
      lines.push(rawLine);
    }
  }
  return lines;
};

const decodeText = (value: string): string => {
  let decoded = value;
  for (const [sequence, replacement] of Object.entries(ICS_ESCAPE_SEQUENCES)) {
    decoded = decoded.split(sequence).join(replacement);
  }
  return decoded.trim();
};

const parseIsoDuration = (value: string): number | null => {
  const match = /^P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i.exec(value.trim());
  if (!match) return null;
  const [, weeks, days, hours, minutes, seconds] = match.map((v) => (v ? parseInt(v, 10) : 0));
  const totalDays = (weeks || 0) * 7 + (days || 0);
  const totalMs = totalDays * MS_PER_DAY + (hours || 0) * 3600000 + (minutes || 0) * 60000 + (seconds || 0) * 1000;
  return Number.isFinite(totalMs) ? totalMs : null;
};

const parseBasicDate = (value: string): Date | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const dateOnlyMatch = /^([0-9]{4})([0-9]{2})([0-9]{2})$/.exec(trimmed);
  if (dateOnlyMatch) {
    const [, y, m, d] = dateOnlyMatch;
    return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  }

  const utcMatch = /^([0-9]{4})([0-9]{2})([0-9]{2})T([0-9]{2})([0-9]{2})([0-9]{2})Z$/.exec(trimmed);
  if (utcMatch) {
    const [, y, m, d, hh, mm, ss] = utcMatch;
    return new Date(
      Date.UTC(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss))
    );
  }

  const floatingMatch = /^([0-9]{4})([0-9]{2})([0-9]{2})T([0-9]{2})([0-9]{2})([0-9]{2})$/.exec(trimmed);
  if (floatingMatch) {
    const [, y, m, d, hh, mm, ss] = floatingMatch;
    return new Date(
      Date.UTC(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss))
    );
  }

  const fallback = new Date(trimmed);
  if (Number.isNaN(fallback.getTime())) return null;
  return fallback;
};

const parseIcsDate = (value: string, params: Record<string, string>): Date | null => {
  const parsed = parseBasicDate(value);
  if (!parsed) return null;

  // If the value specifies a floating time with a timezone, we interpret it as local to that
  // timezone and convert to UTC. Without Temporal we approximate by reusing the parsed UTC value.
  // The approximation is acceptable for occupancy spans because only the difference matters.
  if (params.TZID && /T/.test(value) && !/[zZ]$/.test(value)) {
    const tzDate = new Date(parsed.getTime());
    const locale = params.TZID.replace(/\\/g, '/');
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: locale,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const parts = formatter.formatToParts(parsed);
      const getPart = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? '0');
      return new Date(
        Date.UTC(
          getPart('year'),
          getPart('month') - 1,
          getPart('day'),
          getPart('hour'),
          getPart('minute'),
          getPart('second')
        )
      );
    } catch (err) {
      // Fallback to parsed date if the timezone is not supported.
      return parsed;
    }
  }

  return parsed;
};

const parseIcsEvents = (ics: string): ParsedIcsEvent[] => {
  const lines = unfoldLines(ics);
  const events: ParsedIcsEvent[] = [];
  let current: ParsedIcsEvent | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line) continue;

    if (line.toUpperCase() === 'BEGIN:VEVENT') {
      current = {};
      continue;
    }
    if (line.toUpperCase() === 'END:VEVENT') {
      if (current?.start) events.push(current);
      current = null;
      continue;
    }
    if (!current) continue;

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const meta = line.slice(0, colonIndex);
    const value = line.slice(colonIndex + 1);
    const { key, params } = parseCalendarLineMetadata(meta);

    switch (key) {
      case 'DTSTART':
        current.start = parseIcsDate(value, params);
        break;
      case 'DTEND':
        current.end = parseIcsDate(value, params);
        break;
      case 'DURATION':
        current.duration = value.trim();
        break;
      case 'SUMMARY':
        current.summary = decodeText(value);
        break;
      case 'DESCRIPTION':
        current.description = decodeText(value);
        break;
      case 'STATUS':
        current.status = value.trim();
        break;
      case 'LAST-MODIFIED':
        current.lastModified = parseIcsDate(value, params);
        break;
      case 'DTSTAMP':
        current.dtStamp = parseIcsDate(value, params);
        break;
      case 'UID':
        current.uid = value.trim();
        break;
      default:
        break;
    }
  }

  return events.filter((event) => event.start);
};

const getEndDate = (event: ParsedIcsEvent): Date | null => {
  if (event.end) return event.end;
  if (event.duration && event.start) {
    const durationMs = parseIsoDuration(event.duration);
    if (durationMs) return new Date(event.start.getTime() + durationMs);
  }
  return null;
};

const normalizeStatus = (status?: string) => (status ? status.trim().toLowerCase() : '');

const isCancelled = (event: ParsedIcsEvent) => normalizeStatus(event.status) === ICS_STATUS_CANCELLED;

const deriveMode = (event: ParsedIcsEvent): RawBooking['Mode'] => {
  const normalized = normalizeStatus(event.status);
  if (normalized === 'tentative') return 'option';
  if (normalized === 'confirmed') return 'reservation';

  const haystack = `${event.summary ?? ''}\n${event.description ?? ''}`.toLowerCase();
  for (const keyword of OPTION_KEYWORDS) {
    if (haystack.includes(keyword)) return 'option';
  }
  return 'reservation';
};

const createBookingFromEvent = (
  event: ParsedIcsEvent,
  lotRef: string,
  index: number
): RawBooking | null => {
  if (!event.start || isCancelled(event)) return null;
  const end = getEndDate(event);
  if (!end) return null;
  if (end.getTime() <= event.start.getTime()) return null;

  const mode = deriveMode(event);
  const durationDays = Math.max(
    1,
    Math.ceil((end.getTime() - event.start.getTime()) / MS_PER_DAY)
  );

  const updatedAt = (event.lastModified ?? event.dtStamp ?? new Date()).toISOString();

  return {
    agency: 0,
    site: 0,
    culture: 'fr-FR',
    lot_no: index + 1,
    lot_ref: lotRef,
    start_date: event.start.toISOString(),
    end_date: end.toISOString(),
    comm_no: index + 1,
    price_total_eur: '0',
    price_sr_eur: '0',
    discount_rate: '0',
    hide_price_web: false,
    is_available: false,
    duration_days: durationDays,
    updated_at: updatedAt,
    Mode: mode,
  };
};

export const parseIcsToRawBookings = (
  icsContent: string,
  slug: string,
  lotRef?: string
): RawBooking[] => {
  if (!icsContent?.trim()) return [];
  const events = parseIcsEvents(icsContent);
  const derivedLotRef = lotRef ?? DEFAULT_LOTREF_FOR_SLUG(slug);
  const bookings: RawBooking[] = [];
  events.forEach((event, index) => {
    const booking = createBookingFromEvent(event, derivedLotRef, index);
    if (booking) bookings.push(booking);
  });
  return bookings;
};

export interface IcsCalendarSource {
  slug: string;
  url: string;
  lotRef?: string;
}

export interface IcsLoadResult {
  bookings: RawBooking[];
  successfulCalendars: number;
}

const buildError = (message: string, status?: number) =>
  status ? new Error(`${message} (status ${status})`) : new Error(message);

export const loadIcsBookings = async (
  sources: IcsCalendarSource[]
): Promise<IcsLoadResult> => {
  if (!Array.isArray(sources) || sources.length === 0) {
    return { bookings: [], successfulCalendars: 0 };
  }

  const bookings: RawBooking[] = [];
  let successfulCalendars = 0;

  await Promise.all(
    sources.map(async ({ slug, url, lotRef }) => {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
          throw buildError(`Failed to fetch calendar for ${slug}`, response.status);
        }
        const text = await response.text();
        successfulCalendars += 1;
        bookings.push(...parseIcsToRawBookings(text, slug, lotRef));
      } catch (error) {
        console.error(error);
      }
    })
  );

  return { bookings, successfulCalendars };
};
