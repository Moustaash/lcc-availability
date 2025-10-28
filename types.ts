
export interface Property {
  nameFR: string;
  nameEN: string;
  nameES: string;
  slug: string;
  imageUrl?: string;
}

export enum BookingStatus {
  Confirmed = 'CONFIRMED',
  Option = 'OPTION',
  Cancelled = 'CANCELLED',
  Unknown = 'UNKNOWN'
}

export enum SyncStatus {
  SYNCING = 'SYNCING',
  SYNCED = 'SYNCED',
  ERROR = 'ERROR',
}

export interface Booking {
  id: string;
  summary: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  propertySlug: string;
}

export interface RawBooking {
  agency: number;
  site: number;
  culture: string;
  lot_no: number;
  lot_ref: string;
  start_date: string; // ISO string
  end_date: string;   // ISO string
  comm_no: number;
  price_total_eur: string;
  price_sr_eur: string;
  discount_rate: string;
  hide_price_web: boolean;
  is_available: boolean;
  duration_days: number;
  updated_at: string; // ISO string
  Mode: string; // "reservation" or "option"
}
