import { Component, computed, contentChildren, effect, signal } from '@angular/core';
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
  private projectedTabs = contentChildren(Tab);
  private tabsSignal = signal<Tab[]>([]);

  tabs = computed(() => this.tabsSignal());

  constructor() {
    effect(() => {
      console.log('Tabs actualizados:', this.projectedTabs().map(t => t.title()));
      const tabs = [...this.projectedTabs()];
      this.tabsSignal.set(tabs);
    });

  }

  selectTab(tab: Tab): void {
    this.tabsSignal().forEach(t => t.active.set(false));
    tab.active.set(true);
    console.log('Tab seleccionada:', tab.title());
  }

  closeTab(tab: Tab): void {
    console.log('Cerrando tab:', tab.title());
    const tabs = this.tabsSignal();
    const index = tabs.indexOf(tab);
    const wasActive = tab.active();

    const updated = tabs.filter(t => t !== tab);
    this.tabsSignal.set(updated);

    if (wasActive && updated.length) {
      this.selectTab(updated[Math.max(index - 1, 0)]);
    }
  }
}
