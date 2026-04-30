import { Component, ChangeDetectionStrategy, inject, effect, untracked, Input, signal } from '@angular/core';
import { CalendarStore } from '../../store/calendar.store';
import { HolidayService } from '../../services/holiday.service';
import { CalendarHeaderComponent } from '../calendar-header/calendar-header.component';
import { YearViewComponent } from '../year-view/year-view.component';
import { MonthViewComponent } from '../month-view/month-view.component';
import { WeekViewComponent } from '../week-view/week-view.component';
import { EventModalComponent } from '../event-modal/event-modal.component';
import { ReminderModalComponent } from '../reminder-modal/reminder-modal.component';
import { HolidaySearchComponent } from '../holiday-search/holiday-search.component';

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
    HolidaySearchComponent,
  ],
  templateUrl: './calendar-shell.component.html',
})
export class CalendarShellComponent {
  readonly store = inject(CalendarStore);
  private readonly holidaySvc = inject(HolidayService);

  @Input() compact = false;
  readonly showHolidaySearch = signal(false);

  constructor() {
    effect(() => {
      const year = this.store.focusedDate().getFullYear();
      untracked(() => {
        this.holidaySvc.fetchHolidays(year).subscribe(map => {
          this.store.holidays.update(existing => ({ ...existing, ...map }));
        });
      });
    });

    effect(() => {
      document.documentElement.classList.toggle('dark', this.store.isDarkMode());
    });
  }
}