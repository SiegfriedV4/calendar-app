import { Pipe, PipeTransform } from '@angular/core';
import { format, parse } from 'date-fns';

@Pipe({ name: 'formatTime' })
export class FormatTimePipe implements PipeTransform {
  transform(time: string): string {
    return format(parse(time, 'HH:mm', new Date()), 'h:mm a');
  }
}