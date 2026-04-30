import { Component, ChangeDetectionStrategy, inject, effect, untracked } from '@angular/core';
import { CalendarStore } from '../../store/calendar.store';
import { HolidayService } from '../../services/holiday.service';
import { CalendarHeaderComponent } from '../calendar-header/calendar-header.component';
import { YearViewComponent } from '../year-view/year-view.component';
import { MonthViewComponent } from '../month-view/month-view.component';
import { WeekViewComponent } from '../week-view/week-view.component';
import { EventModalComponent } from '../event-modal/event-modal.component';
import { ReminderModalComponent } from '../reminder-modal/reminder-modal.component';

@Component({
  selector: 'app-calendar-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CalendarHeaderComponent,
    YearViewComponent,
    MonthViewComponent,
    WeekViewComponent,
    EventModalComponent,
    ReminderModalComponent,
  ],
  templateUrl: './calendar-shell.component.html',
})
export class CalendarShellComponent {
  readonly store = inject(CalendarStore);
  private readonly holidaySvc = inject(HolidayService);

  constructor() {
    effect(() => {
      const year = this.store.focusedDate().getFullYear();
      untracked(() => {
        this.holidaySvc.fetchHolidays(year).subscribe(map => {
          this.store.holidays.update(existing => ({ ...existing, ...map }));
        });
      });
    });
  }
}