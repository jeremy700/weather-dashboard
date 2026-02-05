import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Tab } from '../tab/tab';
import { Tabs } from '../tabs/tabs';
import { Location as locationService } from '../../services/location';
import { FormsModule } from '@angular/forms';
import { Modal } from '../modal/modal';

type ModalAction= 'add' | 'select-tab' | 'close-tab' |null;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Modal, FormsModule, Tabs, Tab],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  locationService = inject(locationService);
  zipCode: string | null = null;
  tabsComponent = viewChild(Tabs);
  tabsHasActive = computed(() =>this.tabsComponent()?.hasActiveTab() ?? false);

  showModal = signal(false);
  modalType = signal<'confirm' | 'success' | 'error'>('confirm');
  modalMessage = signal('');
  
  pendingZip: string | null = null;
  pendingTab = signal<Tab | null>(null);
  pendingCloseTab = signal<Tab | null>(null);

  modalAction = signal<ModalAction>(null);

  constructor() {
    effect(() => {
      const error = this.locationService.error();

      if (error) {
        this.modalType.set('error');
        this.modalMessage.set(error);
        this.modalAction.set(null); // no hay confirmación
        this.showModal.set(true);
      }
    });
  }
  
  addCity() {
    if (!this.zipCode) return;
    this.locationService.addLocation(this.zipCode);
  }  

  removeLocation(id:string|null) {
    console.log('Eliminando location con id:', id);
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
    console.log('Solicitud para abrir tab:', tab.title());
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

}
