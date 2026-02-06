import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { City as CityModel } from '../Models/city';
import { Cache } from './cache';
import { tap, of } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class Location {

  private _locations = signal<CityModel[]>([]);
  locations = this._locations.asReadonly();
  error = signal<string | null>(null);

  private readonly forecastUrl = 'https://api.weatherbit.io/v2.0/forecast/daily';
  private readonly baseUrl = 'https://api.weatherbit.io/v2.0/current';
  private readonly apiKey = '6dd9a48e0e3443db8a2adc0add1d96b8';

  constructor(private http: HttpClient, private cache: Cache) { 
    this.restaurarPestanas();
  }

  addLocation(zipCode: string): void {
    this.error.set(null);
    if (this._locations().some(l => l.zipCode === zipCode)) {
      return;
    }

    const cacheKey = this.currentCacheKey(zipCode);
    const cached = this.cache.get(cacheKey);
    console.log('Cache for', cacheKey, ':', cached);

    if (cached) {
      this._locations.update(locations => [
        ...locations,
        { zipCode, ...cached }
      ]);
      return;
    }

    const params = new HttpParams()
      .set('postal_code', zipCode)
      .set('country', 'US')
      .set('key', this.apiKey);

    this.http.get<any>(this.baseUrl, { params }).subscribe({
      next: (data) => {
        console.log(data);

        const city = data.data[0];
        console.log('Caching data', cacheKey, zipCode);
        this.cache.set(cacheKey, city);

        this._locations.update(locations => [
          ...locations,
          { zipCode: zipCode, ...data.data[0] }

        ]);
      },
      error: () => {
        console.error('Error loading weather for', zipCode);
        this.error.set(`El código postal ${zipCode} no existe.`);
      }
    });
  }

  deleteLocation(id: string|null): void {
    console.log('Eliminando en el servicio:', id);
    this._locations.update(locations => locations.filter(l => l.zipCode !== id));
    console.log('Location eliminada. Locations actuales:');
    this._locations().forEach(l => console.log(l.zipCode));
  }

  getForecast(zipCode: string) {

    const key = this.forecastCacheKey(zipCode);
    const cached = this.cache.get(key);

    if (cached) {
      return of({ data: cached });
    }
    const params = new HttpParams()
      .set('postal_code', zipCode)
      .set('country', 'US')
      .set('days', '5')
      .set('key', this.apiKey);

    return this.http.get<{ data: any[] }>(this.forecastUrl, { params }).pipe(
      tap(data => this.cache.set(key, data.data))
    );
  }

  private currentCacheKey(codigoPostal: string) {
    return `weather-current-${codigoPostal}`;
  }

  private forecastCacheKey(codigoPostal: string): string {
    return `weather-forecast-${codigoPostal}`;
  }

  private restaurarPestanas() {
    const codigosZip: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (key.startsWith('weather-current-')) {
        const zip = key.replace('weather-current-', '');

        if (zip && !codigosZip.includes(zip)) {
          codigosZip.push(zip);
        }
      }
    }

    codigosZip.forEach(zip => this.addLocation(zip));
  }
  
}
