import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { startOfWeek, addDays, format, isToday } from 'date-fns';
import { CalendarStore } from '../../store/calendar.store';
import { CalendarEvent, CalendarReminder, EventColor } from '../../models/calendar-event.model';
import { FormatDatePipe } from '../../pipes/format-date.pipe';

interface WeekDay {
  date: Date; iso: string; isToday: boolean;
  events: CalendarEvent[]; reminders: CalendarReminder[];
}

const COLOR_CLASSES: Record<EventColor, string> = {
  blue:   'bg-blue-500 text-white',   red:    'bg-red-500 text-white',
  green:  'bg-green-500 text-white',  orange: 'bg-orange-500 text-white',
  purple: 'bg-purple-500 text-white', pink:   'bg-pink-500 text-white',
  teal:   'bg-teal-500 text-white',   amber:  'bg-amber-500 text-white',
};

@Component({
  selector: 'app-week-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormatDatePipe],
  templateUrl: './week-view.component.html',
})
export class WeekViewComponent {
  readonly store = inject(CalendarStore);
  readonly HOURS = Array.from({ length: 24 }, (_, i) => i);

  readonly weekDays = computed((): WeekDay[] => {
    const weekStart       = startOfWeek(this.store.focusedDate());
    const eventsByDate    = this.store.eventsByDate();
    const remindersByDate = this.store.remindersByDate();
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      const iso  = format(date, 'yyyy-MM-dd');
      return {
        date, iso,
        isToday:   isToday(date),
        events:    (eventsByDate[iso]    ?? []).filter(e => !e.allDay),
        reminders: remindersByDate[iso]  ?? [],
      };
    });
  });

  colorClass(color: EventColor): string { return COLOR_CLASSES[color]; }

  onEventClick(event: CalendarEvent, $event: MouseEvent): void {
    $event.stopPropagation();
    this.store.itemBeingEdited.set(event);
    this.store.activeModal.set('event');
  }

  onReminderClick(reminder: CalendarReminder, $event: MouseEvent): void {
    $event.stopPropagation();
    this.store.itemBeingEdited.set(reminder);
    this.store.activeModal.set('reminder');
  }

  getTopPercent(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return ((h * 60 + m) / (24 * 60)) * 100;
  }

  getHeightPercent(start: string, end: string): number {
    const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    return ((toMin(end) - toMin(start)) / (24 * 60)) * 100;
  }

  onSlotClick(day: WeekDay, hour: number): void {
    const date = new Date(day.date);
    date.setHours(hour, 0, 0, 0);
    this.store.selectedDateForNewItem.set(date);
    this.store.activeModal.set('event');
  }
}
