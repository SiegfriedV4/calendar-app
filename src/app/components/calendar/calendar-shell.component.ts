import { Component, ChangeDetectionStrategy, inject, effect, untracked, Input, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CalendarStore } from '../../store/calendar.store';
import { HolidayService } from '../../services/holiday.service';
import { CalendarView } from '../../models/calendar-view.model';
import { CalendarHeaderComponent } from '../calendar-header/calendar-header.component';
import { EventModalComponent } from '../event-modal/event-modal.component';
import { ReminderModalComponent } from '../reminder-modal/reminder-modal.component';
import { HolidaySearchComponent } from '../holiday-search/holiday-search.component';

@Component({
  selector: 'app-calendar-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    CalendarHeaderComponent,
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
    const router = inject(Router);

    // Keep store.activeView in sync with the route for header button highlighting
    router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntilDestroyed(),
    ).subscribe(e => {
      const path = e.urlAfterRedirects.replace('/', '') as CalendarView;
      if (['year', 'month', 'week'].includes(path)) this.store.setView(path);
    });

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