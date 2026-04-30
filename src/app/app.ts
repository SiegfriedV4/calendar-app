import { Component } from '@angular/core';
import { CalendarShellComponent } from './components/calendar/calendar-shell.component';

@Component({
  selector: 'app-root',
  imports: [CalendarShellComponent],
  template: '<app-calendar-shell />',
})
export class App {}
