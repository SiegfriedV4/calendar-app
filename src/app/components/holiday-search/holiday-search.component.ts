import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalendarStore } from '../../store/calendar.store';
import { HolidayService } from '../../services/holiday.service';
import { Holiday } from '../../models/holiday.model';

@Component({
  selector: 'app-holiday-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './holiday-search.component.html',
})
export class HolidaySearchComponent {
  readonly store            = inject(CalendarStore);
  private readonly holidaySvc = inject(HolidayService);
  private readonly fb         = inject(FormBuilder);

  readonly closed   = output<void>();
  readonly results  = signal<Holiday[]>([]);
  readonly loading  = signal(false);
  readonly searched = signal(false);

  readonly form = this.fb.group({
    country: ['ZA', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
    year: [
      this.store.focusedDate().getFullYear(),
      [Validators.required, Validators.min(2020), Validators.max(2030)],
    ],
  });

  search(): void {
    if (this.form.invalid) return;
    const { country, year } = this.form.getRawValue();
    this.loading.set(true);
    this.searched.set(true);

    this.holidaySvc.fetchHolidays(year!, country!.toUpperCase()).subscribe(map => {
      const all = Object.values(map).flat();
      this.results.set(all.sort((a, b) => a.date.localeCompare(b.date)));
      this.store.holidays.update(existing => ({ ...existing, ...map }));
      this.loading.set(false);
    });
  }
}
