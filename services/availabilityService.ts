import { RawBooking } from '../types';

export async function loadAvailability(): Promise<RawBooking[]> {
  // 'no-store' prevents the browser from caching the response.
  const res = await fetch('/data/availability.json', { cache: 'no-store' });
  if (!res.ok) {
    let errorMsg = 'Failed to load availability';
    try {
      const errorBody = await res.json();
      errorMsg = errorBody.error || errorMsg;
    } catch (e) {
      // Could not parse error body, use default message.
    }
    throw new Error(errorMsg);
  }
  return (await res.json()) as RawBooking[];
}
