import { Injectable, signal, computed } from '@angular/core';
import { startOfWeek, addWeeks, subWeeks, addMonths, subMonths, addYears, subYears } from 'date-fns';
import { CalendarView } from '../models/calendar-view.model';
import { CalendarEvent, CalendarItem, CalendarReminder } from '../models/calendar-event.model';
import { HolidayMap } from '../models/holiday.model';

@Injectable({ providedIn: 'root' })
export class CalendarStore {
  // Primary state
  readonly activeView = signal<CalendarView>('month');
  readonly focusedDate = signal<Date>(new Date());
  readonly calendarEvents = signal<CalendarEvent[]>([]);
  readonly calendarReminders = signal<CalendarReminder[]>([]);
  readonly holidays = signal<HolidayMap>({});

  // Theme
  readonly isDarkMode = signal<boolean>(localStorage.getItem('cal-dark-mode') === 'true');

  toggleDarkMode(): void {
    this.isDarkMode.update(v => !v);
    localStorage.setItem('cal-dark-mode', String(this.isDarkMode()));
  }

  // Modal state
  readonly activeModal = signal<'event' | 'reminder' | null>(null);
  readonly itemBeingEdited = signal<CalendarItem | null>(null);
  readonly selectedDateForNewItem = signal<Date | null>(null);

  // Computed/derived
  readonly weekStart = computed(() => startOfWeek(this.focusedDate()));

  readonly eventsByDate = computed(() => {
    const eventMap: Record<string, CalendarEvent[]> = {};
    for (const event of this.calendarEvents()) {
      (eventMap[event.date] ??= []).push(event);
    }
    return eventMap;
  });

  readonly remindersByDate = computed(() => {
    const reminderMap: Record<string, CalendarReminder[]> = {};
    for (const reminder of this.calendarReminders()) {
      (reminderMap[reminder.date] ??= []).push(reminder);
    }
    return reminderMap;
  });

  // Actions
  setView(newView: CalendarView) { this.activeView.set(newView); }
  navigateNext() { this._navigate(1); }
  navigatePrev() { this._navigate(-1); }

  addEvent(event: CalendarEvent) { this.calendarEvents.update(events => [...events, event]); }
  updateEvent(updatedEvent: CalendarEvent) { this.calendarEvents.update(events => events.map(event => event.id === updatedEvent.id ? updatedEvent : event)); }
  deleteEvent(eventId: string) { this.calendarEvents.update(events => events.filter(event => event.id !== eventId)); }

  addReminder(reminder: CalendarReminder) { this.calendarReminders.update(reminders => [...reminders, reminder]); }
  updateReminder(updatedReminder: CalendarReminder) { this.calendarReminders.update(reminders => reminders.map(reminder => reminder.id === updatedReminder.id ? updatedReminder : reminder)); }
  deleteReminder(reminderId: string) { this.calendarReminders.update(reminders => reminders.filter(reminder => reminder.id !== reminderId)); }

  private _navigate(direction: 1 | -1) {
    const currentDate = this.focusedDate();
    const currentView = this.activeView();
    this.focusedDate.set(
      currentView === 'week' ? (direction === 1 ? addWeeks(currentDate, 1)  : subWeeks(currentDate, 1))  :
      currentView === 'year' ? (direction === 1 ? addYears(currentDate, 1)  : subYears(currentDate, 1))  :
                               (direction === 1 ? addMonths(currentDate, 1) : subMonths(currentDate, 1))
    );
  }
}
