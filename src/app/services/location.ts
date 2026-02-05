import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { City as CityModel } from '../Models/city';


@Injectable({
  providedIn: 'root',
})
export class Location {

  private _locations = signal<CityModel[]>([]);
  locations = this._locations.asReadonly();

  private readonly baseUrl = 'https://api.weatherbit.io/v2.0/current';
  private readonly apiKey = '6dd9a48e0e3443db8a2adc0add1d96b8';

  constructor(private http: HttpClient) { }

  addLocation(zipCode: string): void {

    if (this._locations().some(l => l.zipCode === zipCode)) {
      return;
    }

    const params = new HttpParams()
      .set('postal_code', zipCode)
      .set('country', 'US')
      .set('key', this.apiKey);

    this.http.get<any>(this.baseUrl, { params }).subscribe({
      next: (data) => {
        console.log(data);
        this._locations.update(locations => [
          ...locations,
          { zipCode: zipCode, ...data.data[0] }

        ]);
      },
      error: () => {
        console.error('Error loading weather for', zipCode);
      }
    });
  }

  deleteLocation(id: string|null): void {
    console.log('Eliminando en el servicio:', id);
    this._locations.update(locations => locations.filter(l => l.zipCode !== id));
    console.log('Location eliminada. Locations actuales:');
    this._locations().forEach(l => console.log(l.zipCode));
  }
  
}
