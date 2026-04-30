import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { CalendarStore } from '../../store/calendar.store';
import { CalendarEvent, EventColor, NotificationOffset } from '../../models/calendar-event.model';
import { NotificationService } from '../../services/notification.service';

const COLORS: EventColor[] = ['blue', 'red', 'green', 'orange', 'purple', 'pink', 'teal', 'amber'];
let colorIndex = 0;

export const COLOR_CLASSES: Record<EventColor, string> = {
  blue:   'bg-blue-500 text-white',   red:    'bg-red-500 text-white',
  green:  'bg-green-500 text-white',  orange: 'bg-orange-500 text-white',
  purple: 'bg-purple-500 text-white', pink:   'bg-pink-500 text-white',
  teal:   'bg-teal-500 text-white',   amber:  'bg-amber-500 text-white',
};

@Component({
  selector: 'app-event-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './event-modal.component.html',
})
export class EventModalComponent implements OnInit {
  readonly store = inject(CalendarStore);
  private  notif = inject(NotificationService);
  private  fb    = inject(FormBuilder);

  readonly colors = COLORS;
  colorClass(c: EventColor): string { return COLOR_CLASSES[c]; }

  form = this.fb.group({
    title:                     ['', Validators.required],
    date:                      ['', Validators.required],
    allDay:                    [false],
    startTime:                 ['09:00'],
    endTime:                   ['10:00'],
    color:                     [COLORS[0] as EventColor],
    notificationOffset:        [null as NotificationOffset | null],
    customNotificationMinutes: [null as number | null],
  });

  ngOnInit(): void {
    const editing = this.store.itemBeingEdited();
    const date    = this.store.selectedDateForNewItem();
    if (editing && editing.type === 'event') {
      this.form.patchValue({ ...editing, notificationOffset: editing.notificationOffset ?? null });
    } else {
      if (date) this.form.patchValue({ date: format(date, 'yyyy-MM-dd') });
      this.form.patchValue({ color: COLORS[colorIndex++ % COLORS.length] });
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    const v   = this.form.getRawValue();
    const now = new Date().toISOString();
    const editing = this.store.itemBeingEdited();
    const event: CalendarEvent = {
      id:         editing?.id ?? uuidv4(),
      type:       'event',
      title:      v.title!,
      date:       v.date!,
      allDay:     v.allDay!,
      startTime:  v.allDay ? undefined : v.startTime ?? undefined,
      endTime:    v.allDay ? undefined : v.endTime   ?? undefined,
      color:      v.color!,
      notificationOffset:        v.notificationOffset ?? undefined,
      customNotificationMinutes: v.notificationOffset === 'custom' ? (v.customNotificationMinutes ?? undefined) : undefined,
      createdAt:  editing ? (editing as CalendarEvent).createdAt : now,
      updatedAt:  now,
    };
    if (v.notificationOffset) await this.notif.requestPermission();
    editing ? this.store.updateEvent(event) : this.store.addEvent(event);
    this.notif.schedule(event);
    this.close();
  }

  delete(): void {
    const editing = this.store.itemBeingEdited();
    if (editing) { this.store.deleteEvent(editing.id); this.notif.cancel(editing.id); }
    this.close();
  }

  cancel(): void { this.close(); }

  private close(): void {
    this.store.activeModal.set(null);
    this.store.itemBeingEdited.set(null);
    this.store.selectedDateForNewItem.set(null);
  }
}
