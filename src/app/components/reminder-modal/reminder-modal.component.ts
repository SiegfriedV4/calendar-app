import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { CalendarStore } from '../../store/calendar.store';
import { CalendarReminder, RepeatInterval } from '../../models/calendar-event.model';

@Component({
  selector: 'app-reminder-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './reminder-modal.component.html',
})
export class ReminderModalComponent implements OnInit {
  readonly store = inject(CalendarStore);
  private  fb    = inject(FormBuilder);

  readonly repeatOptions: RepeatInterval[] = ['none', 'daily', 'weekly', 'monthly'];

  form = this.fb.group({
    title:     ['', Validators.required],
    date:      ['', Validators.required],
    allDay:    [true],
    startTime: [''],
    endTime:   [''],
    repeat:    ['none' as RepeatInterval],
  });

  ngOnInit(): void {
    const editing = this.store.itemBeingEdited();
    const date    = this.store.selectedDateForNewItem();
    if (editing && editing.type === 'reminder') {
      this.form.patchValue(editing);
    } else if (date) {
      this.form.patchValue({ date: format(date, 'yyyy-MM-dd') });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const v   = this.form.getRawValue();
    const now = new Date().toISOString();
    const editing = this.store.itemBeingEdited();
    const reminder: CalendarReminder = {
      id:        editing?.id ?? uuidv4(),
      type:      'reminder',
      title:     v.title!,
      date:      v.date!,
      allDay:    v.allDay!,
      startTime: v.allDay ? undefined : v.startTime ?? undefined,
      endTime:   v.allDay ? undefined : v.endTime   ?? undefined,
      repeat:    v.repeat as RepeatInterval,
      createdAt: editing ? (editing as CalendarReminder).createdAt : now,
      updatedAt: now,
    };
    editing ? this.store.updateReminder(reminder) : this.store.addReminder(reminder);
    this.close();
  }

  delete(): void {
    const editing = this.store.itemBeingEdited();
    if (editing) this.store.deleteReminder(editing.id);
    this.close();
  }

  cancel(): void { this.close(); }

  private close(): void {
    this.store.activeModal.set(null);
    this.store.itemBeingEdited.set(null);
    this.store.selectedDateForNewItem.set(null);
  }
}
