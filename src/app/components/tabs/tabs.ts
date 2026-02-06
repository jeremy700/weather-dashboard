import { Component, computed, contentChildren, effect, output, signal } from '@angular/core';
import { Tab } from '../tab/tab';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.html',
  styleUrl: './tabs.css',
})
export class Tabs {
  //Referencia a los componentes <app-tab> proyectados dentro del componente
  private projectedTabs = contentChildren(Tab);
  //Signal interno que mantiene la lista actual de pestañas
  private tabsSignal = signal<Tab[]>([]);
  //Signal y outputs públicos para interactuar con las pestañas
  tabs = computed(() => this.tabsSignal());
  // Evento emitido cuando se cierra una pestaña, pasando su ID
  closed = output<string | null>();
  // Computed que indica si hay alguna pestaña activa
  hasActiveTab = computed(() => this.tabsSignal().some(tab => tab.active()));
  // Eventos emitidos al seleccionar o cerrar una pestaña
  selected = output<Tab>();
  // Evento emitido cuando se solicita el cierre de una pestaña
  closeRequested = output<Tab>();

  constructor() {
    // sincroniza las pestañas proyectadas con la signal interna, se ejecuta cuando hay un cambio em projectedTabs
    effect(() => {
      console.log('Tabs actualizados:', this.projectedTabs().map(t => t.title()));
      const tabs = [...this.projectedTabs()];
      this.tabsSignal.set(tabs);
    });
  }

  selectTab(tab: Tab): void {
    //Emite el evento de selección de pestaña.
    this.selected.emit(tab);
  }

  closeTab(tab: Tab): void {
    //Emite el evento de solicitud de cierre de pestaña.
    this.closeRequested.emit(tab);
  }

  confirmCloseTab(tab: Tab): void {
    const tabs = this.tabsSignal();
    // Filtra la pestaña cerrada y actualiza la signal (Elimina la pestaña cerrada)
    const updated = tabs.filter(t => t !== tab);
    this.tabsSignal.set(updated);
    // Emite el evento de pestaña cerrada con el ID de la pestaña cerrada
    this.closed.emit(tab.id());
  }

  activateTab(tab: Tab): void {
    // Desactiva todas las pestañas y activa la pestaña seleccionada
    this.tabsSignal().forEach(t => t.active.set(false));
    tab.active.set(true);
  }
}
