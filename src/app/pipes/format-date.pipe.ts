import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';

@Pipe({ name: 'formatDate' })
export class FormatDatePipe implements PipeTransform {
  transform(date: Date | string, fmt = 'MMM d, yyyy'): string {
    return format(typeof date === 'string' ? new Date(date) : date, fmt);
  }
}