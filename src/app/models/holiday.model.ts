export interface Holiday {
  name: string;
  date: string;   // YYYY-MM-DD
  observed: string;
  public: boolean;
  country: string;
  uuid: string;
}

export interface HolidayApiResponse {
  status: number;
  holidays: Holiday[];
}

export type HolidayMap = Record<string, Holiday[]>; // keyed by YYYY-MM-DD this is used for quick lookup of holidays for a given date when rendering the calendar and for filtering events by holiday