export type EventColor = 'blue' | 'red' | 'green' | 'orange' | 'purple' | 'pink' | 'teal' | 'amber';
export type NotificationOffset = 10 | 60 | 1440 | 'custom';
export type RepeatInterval = 'none' | 'daily' | 'weekly' | 'monthly';

export interface CalendarEvent {
  id: string;           // uuid
  type: 'event';
  title: string;
  date: string;         // ISO date string YYYY-MM-DD
  allDay: boolean;
  startTime?: string;   // HH:mm
  endTime?: string;     // HH:mm
  color: EventColor;
  notificationOffset?: NotificationOffset;
  customNotificationMinutes?: number;
  notificationScheduledAt?: number; //  custom notifications
  createdAt: string;
  updatedAt: string;
}

export interface CalendarReminder {
  id: string;
  type: 'reminder';
  title: string;
  date: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
  repeat: RepeatInterval;
  createdAt: string;
  updatedAt: string;
}

export type CalendarItem = CalendarEvent | CalendarReminder;
