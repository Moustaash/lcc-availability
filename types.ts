
export enum BookingStatus {
  Confirmed = 'reservation',
  Option = 'option',
}

export interface Property {
  nameFR: string;
  nameEN: string;
  nameES: string;
  slug: string;
  imageUrl: string;
}

export interface RawBooking {
  agency: number;
  site: number;
  culture: string;
  lot_no: number;
  lot_ref: string;
  start_date: string;
  end_date: string;
  comm_no: number;
  price_total_eur: string;
  price_sr_eur: string;
  discount_rate: string;
  hide_price_web: boolean;
  is_available: boolean;
  duration_days: number;
  updated_at: string;
  Mode: 'reservation' | 'option';
}

export interface Booking {
  id: string;
  propertySlug: string;
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  price: number;
  isAvailable: boolean;
}

export enum SyncStatus {
  Idle,
  Syncing,
  Success,
  Error,
}
