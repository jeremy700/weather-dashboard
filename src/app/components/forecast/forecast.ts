import { Component, effect, inject, input, signal } from '@angular/core';
import { Location } from '../../services/location';
import { City } from '../../Models/city';

@Component({
  selector: 'app-forecast',
  standalone: true,
  imports: [],
  templateUrl: './forecast.html',
  styleUrl: './forecast.css',
})
export class Forecast {

  location = input.required<any>();
  private locationService = inject(Location);

  forecast = signal<City[]>([]);

  constructor() {
    effect(() => {
      const loc = this.location();
      if (!loc) return;
      
        this.locationService.getForecast(loc.zipCode).subscribe({
          next: (data) => {
            this.forecast.set(data.data);
          },
          error: (error) => {
            console.error('Error loading forecast:', error);
          }
        });
    });
  }
}
