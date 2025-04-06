export interface TimetableEntry {
  day?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  period?: 1 | 2 | 3 | 4 | 5 | 6;
  is_intensive_course?: boolean;
  intensive_schedule?: string;
  type?: string;
  is_in_person?: boolean;
  is_on_demand?: boolean;
  location?: string;
  note?: string;
}
