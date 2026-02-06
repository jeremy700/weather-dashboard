import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { City as CityModel } from '../Models/city';
import { Cache } from './cache';
import { tap, of } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class Location {

  private appSettings: any;
  // Signal que mantiene la lista de ubicaciones actuales
  private _locations = signal<CityModel[]>([]);
  // Signal de solo lectura (copia de _locations)
  locations = this._locations.asReadonly();
  error = signal<string | null>(null);

  private forecastUrl: string = '';
  private baseUrl: string = '';
  private apiKey: string = '';

  constructor(private http: HttpClient, private cache: Cache) { 
    this.getJsonConfig().subscribe(config => {
      this.appSettings = config;
      this.forecastUrl = this.appSettings.weather.forecastUrl;
      this.baseUrl = this.appSettings.weather.currentUrl;
      this.apiKey = this.appSettings.weather.apiKey;
      console.log('App settings cargadas en Location service:', {"forecastUrl":this.forecastUrl, "baseUrl":this.baseUrl, "apiKey":this.apiKey});
      this.restaurarPestanas();
    });
  }

  getJsonConfig() {
    return this.http.get('config.json');
  }

  addLocation(zipCode: string): void {
    // Reinicia el error antes de intentar agregar una nueva ubicación
    this.error.set(null);
    // Verifica si la ubicación ya existe
    if (this._locations().some(l => l.zipCode === zipCode)) {
      return;
    }
    // Guarda la pestaña activa en caché
    this.cache.setTabsActivaCache(zipCode);
    // Verifica si hay datos en caché para el código postal
    const cacheKey = this.currentCacheKey(zipCode);
    const cached = this.cache.get(cacheKey);
    
    // Si hay datos en caché, los usa directamente y no hace llamado http
    if (cached) {
      this._locations.update(locations => [...locations, { zipCode, ...cached }]);
      return;
    }

    // Si no hay datos en caché, hace el llamado HTTP para obtener los datos actuales
    const params = new HttpParams()
      .set('postal_code', zipCode)
      .set('country', 'US')
      .set('key', this.apiKey);

    this.http.get<any>(this.baseUrl, { params }).subscribe({
      next: (data) => {
        const city = data.data[0];
        // Guarda los datos en caché
        this.cache.set(cacheKey, city);
        // Actualiza la lista de ubicaciones con los nuevos datos
        this._locations.update(locations => [...locations, { zipCode: zipCode, ...data.data[0] }]);
      },
      error: () => {
        console.error('Error loading weather for', zipCode);
        this.error.set(`El código postal ${zipCode} no existe.`);
      }
    });
  }

  // Elimina una ubicación por su ID (código postal), se usa cuando se cierra una pestaña
  deleteLocation(id: string|null): void {
    this._locations.update(locations => locations.filter(l => l.zipCode !== id));
    this.cache.removeTabActiva(id || '');
  }

  // Obtiene el pronóstico del tiempo para un código postal específico
  getForecast(zipCode: string) {
    // Primero verifica si hay datos en caché
    const key = this.forecastCacheKey(zipCode);
    const cached = this.cache.get(key);

    // Si hay datos en caché, los devuelve como un observable
    if (cached) {
      return of({ data: cached });
    }
    // Si no hay datos en caché, hace el llamado HTTP para obtener el pronóstico
    const params = new HttpParams()
      .set('postal_code', zipCode)
      .set('country', 'US')
      .set('days', '5')
      .set('key', this.apiKey);
    // Realiza el llamado HTTP y guarda los datos en caché al recibir la respuesta
    return this.http.get<{ data: any[] }>(this.forecastUrl, { params }).pipe(tap(data => this.cache.set(key, data.data))
    );
  }

  private currentCacheKey(codigoPostal: string) {
    return `weather-current-${codigoPostal}`;
  }

  private forecastCacheKey(codigoPostal: string): string {
    return `weather-forecast-${codigoPostal}`;
  }

  // Restaura las pestañas activas desde la caché al iniciar el servicio, es llamado en el constructor
  private restaurarPestanas() {
    const zipCodes = this.cache.getTabsActivasCache();
    if (!zipCodes || !zipCodes.length) return;

    zipCodes.forEach(zip => {
      this.addLocation(zip);
    });
  }
  
}
