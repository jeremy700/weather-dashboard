import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { Tab } from '../tab/tab';
import { Tabs } from '../tabs/tabs';
import { Location as locationService } from '../../services/location';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, Tabs, Tab],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  locationService = inject(locationService);
  zipCode: string | null = null;
  tabsComponent = viewChild(Tabs);
  tabsHasActive = computed(() =>this.tabsComponent()?.hasActiveTab() ?? false);
  
  addCity() {
    if (!this.zipCode) return;
    this.locationService.addLocation(this.zipCode);
  }  

  removeLocation(id:string|null) {
    console.log('Eliminando location con id:', id);
    this.locationService.deleteLocation(id?.toLowerCase() || null);
  }

}
