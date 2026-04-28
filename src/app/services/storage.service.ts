import { Injectable, effect, inject } from '@angular/core';
import { CalendarStore } from '../store/calendar.store';
import { CalendarEvent, CalendarReminder } from '../models/calendar-event.model';
import { HolidayMap } from '../models/holiday.model';

export interface HolidayCacheEntry { data: HolidayMap; ts: number; }

const STORAGE_KEYS = {
  events: 'calendar_events',
  reminders: 'calendar_reminders',
  holidayCachePrefix: 'calendar_holidays_',
} as const;

@Injectable({ providedIn: 'root' })
export class StorageService {
  private store = inject(CalendarStore);

  constructor() {
    this.load();

    effect(() => {
      localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(this.store.calendarEvents()));
    });

    effect(() => {
      localStorage.setItem(STORAGE_KEYS.reminders, JSON.stringify(this.store.calendarReminders()));
    });
  }

  getHolidayCache(key: string): HolidayCacheEntry | null {
    const raw = localStorage.getItem(STORAGE_KEYS.holidayCachePrefix + key);
    if (!raw) return null;
    try { return JSON.parse(raw) as HolidayCacheEntry; } catch { return null; }
  }

  setHolidayCache(key: string, entry: HolidayCacheEntry): void {
    localStorage.setItem(STORAGE_KEYS.holidayCachePrefix + key, JSON.stringify(entry));
  }

  private load(): void {
    const rawEvents = localStorage.getItem(STORAGE_KEYS.events);
    const rawReminders = localStorage.getItem(STORAGE_KEYS.reminders);

    if (rawEvents) {
      try {
        this.store.calendarEvents.set(JSON.parse(rawEvents) as CalendarEvent[]);
      } catch {
        localStorage.removeItem(STORAGE_KEYS.events);
      }
    }

    if (rawReminders) {
      try {
        this.store.calendarReminders.set(JSON.parse(rawReminders) as CalendarReminder[]);
      } catch {
        localStorage.removeItem(STORAGE_KEYS.reminders);
      }
    }
  }
}
