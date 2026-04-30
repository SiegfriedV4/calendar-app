import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday,
} from 'date-fns';
import { CalendarStore } from '../../store/calendar.store';
import { FormatDatePipe } from '../../pipes/format-date.pipe';

interface MiniDayCell { date: Date; iso: string; isCurrentMonth: boolean; isToday: boolean; }

@Component({
  selector: 'app-year-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormatDatePipe],
  templateUrl: './year-view.component.html',
})
export class YearViewComponent {
  readonly store = inject(CalendarStore);
  readonly DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  readonly months = computed(() => {
    const year = this.store.focusedDate().getFullYear();
    return Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(year, i, 1);
      return { monthDate, label: format(monthDate, 'MMMM'), days: this.buildDays(monthDate) };
    });
  });

  goToMonth(monthDate: Date): void {
    this.store.focusedDate.set(monthDate);
    this.store.setView('month');
  }

  private buildDays(monthDate: Date): MiniDayCell[] {
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(monthDate)),
      end:   endOfWeek(endOfMonth(monthDate)),
    }).map(date => ({
      date,
      iso: format(date, 'yyyy-MM-dd'),
      isCurrentMonth: isSameMonth(date, monthDate),
      isToday: isToday(date),
    }));
  }
}