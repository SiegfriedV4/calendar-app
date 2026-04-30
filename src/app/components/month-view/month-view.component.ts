import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday,
} from 'date-fns';
import { CalendarStore } from '../../store/calendar.store';
import { CalendarEvent, CalendarReminder, EventColor } from '../../models/calendar-event.model';
import { Holiday } from '../../models/holiday.model';
import { FormatDatePipe } from '../../pipes/format-date.pipe';

interface DayCell {
  date: Date; iso: string; isCurrentMonth: boolean; isToday: boolean;
  events: CalendarEvent[]; reminders: CalendarReminder[]; holiday: Holiday | null;
}

const COLOR_CLASSES: Record<EventColor, string> = {
  blue: 'bg-blue-500', red: 'bg-red-500', green: 'bg-green-500', orange: 'bg-orange-500',
  purple: 'bg-purple-500', pink: 'bg-pink-500', teal: 'bg-teal-500', amber: 'bg-amber-500',
};

@Component({
  selector: 'app-month-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormatDatePipe],
  templateUrl: './month-view.component.html',
})
export class MonthViewComponent {
  readonly store = inject(CalendarStore);
  readonly DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  readonly monthDays = computed((): DayCell[] => {
    const focused         = this.store.focusedDate();
    const eventsByDate    = this.store.eventsByDate();
    const remindersByDate = this.store.remindersByDate();
    const holidays        = this.store.holidays();
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(focused)),
      end:   endOfWeek(endOfMonth(focused)),
    }).map(date => {
      const iso = format(date, 'yyyy-MM-dd');
      return {
        date, iso,
        isCurrentMonth: isSameMonth(date, focused),
        isToday:        isToday(date),
        events:         eventsByDate[iso]    ?? [],
        reminders:      remindersByDate[iso] ?? [],
        holiday:        holidays[iso]?.[0]   ?? null,
      };
    });
  });

  colorClass(color: EventColor): string { return COLOR_CLASSES[color]; }

  onDayClick(day: DayCell): void {
    this.store.selectedDateForNewItem.set(day.date);
    this.store.activeModal.set('event');
  }

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
}
