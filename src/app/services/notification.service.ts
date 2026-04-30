import { Injectable } from '@angular/core';
import { CalendarEvent } from '../models/calendar-event.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }

  schedule(event: CalendarEvent): void {
    this.cancel(event.id); // clear any existing timer

    const fireAt = this.calcFireTime(event);
    if (!fireAt || fireAt <= Date.now()) return;

    const delay = fireAt - Date.now();
    const timer = setTimeout(() => {
      new Notification(event.title, {
        body: `Reminder: ${event.title}`,
        icon: '/assets/bell.png'
      });
    }, delay);

    this.timers.set(event.id, timer);
  }

  scheduleAll(events: CalendarEvent[]): void {
    for (const event of events) this.schedule(event);
  }

  cancel(id: string): void {
    const t = this.timers.get(id);
    if (t) { clearTimeout(t); this.timers.delete(id); }
  }

  cancelAll(): void {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers.clear();
  }

  private calcFireTime(event: CalendarEvent): number | null {
    if (!event.notificationOffset) return null;

    const [year, month, day] = event.date.split('-').map(Number);
    const [hours, minutes] = (event.startTime ?? '00:00').split(':').map(Number);
    const eventStart = new Date(year, month - 1, day, hours, minutes).getTime();

    if (event.notificationOffset === 'custom') {
      const mins = event.customNotificationMinutes ?? 0;
      return eventStart - mins * 60_000;
    }

    return eventStart - event.notificationOffset * 60_000;
  }
}