import { Component, ChangeDetectionStrategy, inject, computed, output } from '@angular/core';
import { format } from 'date-fns';
import { CalendarStore } from '../../store/calendar.store';
import { CalendarView } from '../../models/calendar-view.model';

@Component({
  selector: 'app-calendar-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar-header.component.html',
})
export class CalendarHeaderComponent {
  readonly store  = inject(CalendarStore);
  readonly views: CalendarView[] = ['year', 'month', 'week'];

  readonly holidaySearchToggled = output<void>();

  readonly title = computed(() => {
    const d = this.store.focusedDate();
    switch (this.store.activeView()) {
      case 'year':  return format(d, 'yyyy');
      case 'month': return format(d, 'MMMM yyyy');
      case 'week':  return format(d, "'Week of' MMM d, yyyy");
    }
  });

  goToday(): void { this.store.focusedDate.set(new Date()); }

  openNewEvent(): void {
    this.store.selectedDateForNewItem.set(new Date());
    this.store.activeModal.set('event');
  }

  openNewReminder(): void {
    this.store.selectedDateForNewItem.set(new Date());
    this.store.activeModal.set('reminder');
  }
}