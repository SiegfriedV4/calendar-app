import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday,
} from 'date-fns';
import { CalendarStore } from '../../store/calendar.store';
import { HolidayMap } from '../../models/holiday.model';
import { FormatDatePipe } from '../../pipes/format-date.pipe';

interface MiniDayCell {
  date: Date; iso: string; isCurrentMonth: boolean; isToday: boolean; holiday: string | null;
}

@Component({
  selector: 'app-year-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormatDatePipe],
  templateUrl: './year-view.component.html',
})
export class YearViewComponent {
  readonly store  = inject(CalendarStore);
  readonly router = inject(Router);
  readonly DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  readonly months = computed(() => {
    const year     = this.store.focusedDate().getFullYear();
    const holidays = this.store.holidays();
    return Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(year, i, 1);
      return { monthDate, label: format(monthDate, 'MMMM'), days: this.buildDays(monthDate, holidays) };
    });
  });

  goToMonth(monthDate: Date): void {
    this.store.focusedDate.set(monthDate);
    this.store.setView('month');
    this.router.navigate(['/month']);
  }

  onDayClick(cell: MiniDayCell, $event: MouseEvent): void {
    $event.stopPropagation();
    this.store.focusedDate.set(cell.date);
    this.store.selectedDateForNewItem.set(cell.date);
    this.store.setView('month');
    this.router.navigate(['/month']);
    this.store.activeModal.set('event');
  }

  private buildDays(monthDate: Date, holidays: HolidayMap): MiniDayCell[] {
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(monthDate)),
      end:   endOfWeek(endOfMonth(monthDate)),
    }).map(date => {
      const iso = format(date, 'yyyy-MM-dd');
      return {
        date,
        iso,
        isCurrentMonth: isSameMonth(date, monthDate),
        isToday:        isToday(date),
        holiday:        holidays[iso]?.[0]?.name ?? null,
      };
    });
  }
}
