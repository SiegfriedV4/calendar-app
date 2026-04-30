import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environments';
import { Holiday, HolidayApiResponse, HolidayMap } from '../models/holiday.model';
import { StorageService } from './storage.service';

const CACHE = 24 * 60 * 60 * 1000; // 24 h TTL

@Injectable({ providedIn: 'root' })
export class HolidayService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private apiKey = environment.holidayApiKey;
  private memCache = new Map<string, { data: HolidayMap; ts: number }>();

  fetchHolidays(year: number, country = 'ZA'): Observable<HolidayMap> {
    const key = `${country}-${year}`;

    // 1. Memory cache hit
    const mem = this.memCache.get(key);
    if (mem && Date.now() - mem.ts < CACHE) {
      return of(mem.data);
    }

    // 2. localStorage cache hit
    const stored = this.storage.getHolidayCache(key);
    if (stored && Date.now() - stored.ts < CACHE) {
      this.memCache.set(key, stored);
      return of(stored.data);
    }

    // 3. Network fetch
    const url = `/holiday-api/v1/holidays?key=${this.apiKey}`
          + `&country=${country}&year=${year}&pretty`;
    return this.http.get<HolidayApiResponse>(url).pipe(
      map(resp => this.buildMap(resp.holidays)),
      tap(data => {
        this.memCache.set(key, { data, ts: Date.now() });
        this.storage.setHolidayCache(key, { data, ts: Date.now() });
      }),
      catchError(() => of({}))
    );
  }

  private buildMap(holidays: Holiday[]): HolidayMap {
    const map: HolidayMap = {};
    for (const h of holidays) {
      (map[h.date] ??= []).push(h);
    }
    return map;
  }
}