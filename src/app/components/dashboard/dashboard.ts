import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Tab } from '../tab/tab';
import { Tabs } from '../tabs/tabs';
import { Location as locationService } from '../../services/location';
import { FormsModule } from '@angular/forms';
import { Modal } from '../modal/modal';
import { Forecast } from '../forecast/forecast';
import { Cache } from '../../services/cache';

type ModalAction= 'add' | 'select-tab' | 'close-tab' |null;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Modal, FormsModule, Tabs, Tab, Forecast],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  locationService = inject(locationService);
  //Signal para el código postal ingresado por el usuario
  zipCode: string | null = null;
  //Referencia al componente Tabs para interactuar con él
  tabsComponent = viewChild(Tabs);
  //Computed que indica si hay alguna pestaña activa, se usa para habilitar/deshabilitar la vista del pronóstico y el dasboard decoratico
  tabsHasActive = computed(() =>this.tabsComponent()?.hasActiveTab() ?? false);
  //Signal y variables para controlar el modal de confirmación y mensajes
  showModal = signal(false);
  modalType = signal<'confirm' | 'success' | 'error'>('confirm');
  modalMessage = signal('');
  //Variables para almacenar datos pendientes de acción en el modal, por ejemplo, el código postal a agregar o la pestaña a seleccionar/cerrar, se guarda hasta que el usuario confirme la acción
  pendingZip: string | null = null;
  // Pestaña pendiente de selección, mismo caso anterior, donde hay que esperar la confirmación del usuario
  pendingTab = signal<Tab | null>(null);
  // Pestaña pendiente de cierre
  pendingCloseTab = signal<Tab | null>(null);
  // Acción pendiente en el modal, se usa para identificar si la accion es agregar, seleccionar o cerrar una pestaña
  modalAction = signal<ModalAction>(null);
  cacheTtlHours = signal<number>(2);

  constructor(private cache: Cache) {
    const ttlMs = this.cache.getTiempoCache();
    this.cacheTtlHours.set(ttlMs / (1000 * 60 * 60));
    // Efecto para mostrar el modal de error cuando hay un error en el servicio de ubicación
    effect(() => {
      const error = this.locationService.error();

      if (error) {
        this.modalType.set('error');
        this.modalMessage.set(error);
        this.modalAction.set(null);
        this.showModal.set(true);
      }
    });
  }
  
  addCity() {
    if (!this.zipCode) return;
    this.locationService.addLocation(this.zipCode);
  }  

  removeLocation(id:string|null) {
    this.locationService.deleteLocation(id?.toLowerCase() || null);
  }

  openAddModal() {
    if (!this.zipCode) return;

    this.pendingZip = this.zipCode;
    this.modalType.set('confirm');
    this.modalAction.set('add');
    this.modalMessage.set(`Desea agregar el código postal ${this.zipCode}?`);
    this.showModal.set(true);
  }

  confirmModal() {
    switch (this.modalAction()) {

      case 'add':
        if (this.pendingZip) {
          this.locationService.addLocation(this.pendingZip);
        }
        break;

      case 'select-tab':
        const tab = this.pendingTab();
        if (tab) {
          this.tabsComponent()?.activateTab(tab);
        }
        break;
      case 'close-tab':
        const tabToClose = this.pendingCloseTab();
        if (tabToClose) {
          this.tabsComponent()?.confirmCloseTab(tabToClose);
        }
        break;
    }

    this.closeModal();
  }

  closeModal() {
    this.showModal.set(false);
    this.pendingZip = null;
    this.pendingTab.set(null);
    this.pendingCloseTab.set(null);
    this.modalAction.set(null);
    this.locationService.error.set(null);
  }

  onTabCloseRequested(tab: Tab) {
    this.pendingCloseTab.set(tab);
    this.modalAction.set('close-tab');
    this.modalType.set('confirm');
    this.modalMessage.set(
      `Desea cerrar la pestaña "${tab.title()}"?`
    );
    this.showModal.set(true);
  }

  onTabSelected(tab: Tab) {
    this.pendingTab.set(tab);
    this.modalMessage.set(`Desea abrir la pestaña "${tab.title()}"?`);
    this.modalType.set('confirm');
    this.modalAction.set('select-tab');
    this.showModal.set(true);
  }

  confirmTabSelection() {
    const tab = this.pendingTab();
    if (!tab) return;
    this.tabsComponent()?.activateTab(tab);
    this.closeModal();
  }

  updateTiempoCache(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const hours = Number(selectElement.value);
    const ttlMs = hours * 60 * 60 * 1000;
    this.cache.setTiempoCache(ttlMs);
    this.cacheTtlHours.set(hours);
  }

}
